import os
import sys

from twisted.protocols import basic
from twisted.internet import stdio, reactor

from ggplib.db import lookup
from ggplib.util import log

from ggpzero.defs import templates
from ggpzero.player.puctplayer import PUCTEvaluator



def main(args):
    from ggplib import interface
    interface.initialise_k273(8, log_name_base="bridge")
    log.initialise()

    from ggpzero.util.keras import init
    init()

    config_name = args[0]

    if len(args) > 1:
        generation = args[1]
    else:
        generation = "v7_42"

    conf = templates.puct_config_template(generation, config_name)
    conf.generation = generation

    puct_evaluator = PUCTEvaluator(conf)

    # get reversi game info and initlise puct evaluator
    game_info = lookup.by_name("reversi")
    puct_evaluator.init(game_info)

    nboard_client = NBoardClient(puct_evaluator)

    stdio.StandardIO(nboard_client)
    reactor.run()


###############################################################################

if __name__ == '__main__':
    main(sys.argv[1:])
