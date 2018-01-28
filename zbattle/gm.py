import os
import sys
import gzip
import time
import shutil

import json

from twisted.internet import reactor

from ggplib.util import log
from ggplib.db import lookup

from ggpzero.util import attrutil, runprocs
from ggpzero.util.broker import Broker, ServerFactory

# from ggpzero.defs import msgs, confs, templates

# connect.
# Ping <--> Pong.
# RegisterPlayerRequest <--> RegisterPlayerResponse

# player is now in valid state.

# ask if ready to play...

# PlayerReadyRequest <---> PlayerReadyResponse

# if ready, add to scheduling queue

# StartNewMatch <---> InitialisedMatch

# MatchMoveRequest <---> PlayMatchMove

# MatchEnd <---> MatchEndResponse


def critical_error(msg):
    log.critical(msg)
    reactor.stop()
    sys.exit(1)


class PlayerConnection(object):
    def __init__(self, connection, ping_time_sent):
        # this is the connection
        self.connection = connection
        self.valid = True
        self.ping_time_sent = ping_time_sent

        self.conf = None
        # are we ready to be scheduled to play a game
        self.ready = False

    def xxx(self):
        pass


    def cleanup(self):
        self.valid = False


class GameMasterBroker(Broker):
    def __init__(self, conf_filename, conf=None):
        Broker.__init__(self)

        self.conf_filename = conf_filename
        if conf is None:
            assert os.path.exists(conf_filename)
            conf = attrutil.json_to_attr(open(conf_filename).read())

        assert isinstance(conf, confs.GameMasterBrokerConfig)
        attrutil.pprint(conf)

        self.conf = conf

        self.game_info = lookup.by_name("reversi")

        self.players = {}

        self.register(msgs.Pong, self.on_pong)
        self.register(msgs.Ok, self.on_ok)

        # finally start listening on port
        reactor.listenTCP(conf.port, ServerFactory(self))

    def new_broker_client(self, client_conn):
        self.new_player(self, client_conn)

    def remove_broker_client(self, client_conn):
        self.remove_player(self, client_conn)

    def new_player(self, player_conn):
        self.players[player_conn] = PlayerConnection(player_conn, time.time())

        log.debug("New player %s" % player_conn)
        worker.send_msg(msgs.Ping())
        worker.send_msg(msgs.RegisterPlayerRequest(self.conf.games))

    def on_register_player(self, player_conn, msg):
        player = self.players[player_conn]
        player.conf = msg.conf

    def on_pong(self, player_conn, msg):
        player = self.players[player_conn]
        log.info("player %s, ping/pong time %.3f msecs" % (worker,
                                                           (time.time() - info.ping_time_sent) * 1000))


def start_server_factory():
    from ggplib.util.init import setup_once
    setup_once("server")

    from ggpzero.util.keras import init
    init()

    if sys.argv[1] == "-c":
        conf = templates.server_config_template(sys.argv[2], sys.argv[3])
        ServerBroker(sys.argv[4], conf)

    else:
        filename = sys.argv[1]
        assert os.path.exists(filename)
        ServerBroker(filename)

    reactor.run()


if __name__ == "__main__":
    start_server_factory()
