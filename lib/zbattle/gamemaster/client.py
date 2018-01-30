from builtins import super

import os
import sys
import time
import shutil

from twisted.internet import reactor

from ggplib.util import log
from ggplib.db import lookup

from ggpzero.util import attrutil

from ggpzero.defs import msgs, confs

from ggpzero.util.broker import Broker, WorkerFactory
from ggpzero.util import cppinterface

from ggpzero.training import nn_train
from ggpzero.nn.manager import get_manager


class TournamentClient(Broker):
    def __init__(self):
        super().__init__()

        self.register(msgs.Ping, self.on_ping)
        self.register(msgs.RegisterPlayerRequest, self.on_register_player_request)
        self.register(msgs.PlayerReadyRequest, self.player_ready_request)

        self.register(msgs.RequestSamples, self.on_request_samples)
        self.register(msgs.TrainNNRequest, self.on_train_request)

        # connect to server
        reactor.callLater(0, self.connect)

    def connect(self):
        reactor.connectTCP(self.conf.connect_ip_addr,
                           self.conf.connect_port,
                           WorkerFactory(self))

    def on_ping(self, server, msg):
        server.send_msg(msgs.Pong())

    def on_request_config(self, server, msg):
        return msgs.WorkerConfigMsg(self.conf)

    def on_configure(self, server, msg):
        attrutil.pprint(msg)

        if self.game_info is None:
            self.game_info = lookup.by_name(msg.game)
            self.sm = self.game_info.get_sm()
        else:
            self.game_info.game == msg.game

        self.nn = get_manager().load_network(msg.game, msg.generation)

        if self.supervisor is None:
            self.supervisor = cppinterface.Supervisor(self.sm, self.nn,
                                                      batch_size=self.conf.self_play_batch_size,
                                                      sleep_between_poll=self.conf.sleep_between_poll)
            self.supervisor.start_self_play(msg.self_play_conf, self.conf.inline_manager)
        else:
            self.supervisor.update_nn(self.nn)
            self.supervisor.clear_unique_states()

        return msgs.Ok("configured")

    def cb_from_superviser(self):
        self.samples += self.supervisor.fetch_samples()

        # keeps the tcp connection active for remote workers
        if time.time() > self.on_request_samples_time + self.conf.server_poll_time:
            return True

        return len(self.samples) > self.conf.min_num_samples

    def on_request_samples(self, server, msg):
        self.on_request_samples_time = time.time()

        assert self.supervisor is not None
        self.samples = []
        self.supervisor.reset_stats()

        log.debug("Got request for sample with number unique states %s" % len(msg.new_states))

        # update duplicates
        for s in msg.new_states:
            self.supervisor.add_unique_state(s)

        start_time = time.time()
        self.supervisor.poll_loop(do_stats=True, cb=self.cb_from_superviser)

        log.info("Number of samples %s, prediction calls %d, predictions %d" % (len(self.samples),
                                                                                self.supervisor.num_predictions_calls,
                                                                                self.supervisor.total_predictions))
        log.info("time takens python/predict/all %.2f / %.2f / %.2f" % (self.supervisor.acc_time_polling,
                                                                        self.supervisor.acc_time_prediction,
                                                                        time.time() - start_time))

        log.info("Done all samples")

        m = msgs.RequestSampleResponse(self.samples, 0)
        server.send_msg(m)

    def on_train_request(self, server, msg):
        log.warning("request to train %s" % msg)

        nn_train.parse_and_train(msg)
        return msgs.Ok("network_trained")


def start_worker_factory():
    from ggplib.util.init import setup_once
    setup_once("worker")

    from ggpzero.util.keras import init
    init()

    broker = Worker(sys.argv[1])
    broker.start()


if __name__ == "__main__":
    start_worker_factory()
