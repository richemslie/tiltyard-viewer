'''
# Origninal from hippolyta - from with license:
# Copyright Tom Plick 2010, 2014.
# This file is released under the GPL version 3; see LICENSE.

'''

import os
import re
import sys
import time
import pprint
import urllib2

from ggplib.player.gamemaster import GameMaster
from ggplib.db.helper import get_gdl_for_game

from ggpzero.util import attrutil as at
from ggpzero.player import cpuctplayer
# XXX use logging instead of prints

@at.register_attrs
class GameConfig(object):
    game_name = at.attribute("reversi")
    generation = at.attribute("genx")

    # 100 * n
    sims_multiplier = at.attribute(8)


@at.register_attrs
class LGConfig(object):
    # LG convention is to postfix non humans with "_bot"
    whoami = at.attribute("gzero_bot")

    # fetch these from your browser, after logged in
    cookie = at.attribute("login2=.......; JSESSIONID=.......")

    # dry run, dont actually send moves
    dry_run = at.attribute(True)

    # list of GameConfig
    play_games = at.attribute(default=at.attr_factory(list))


def template_config():
    c = LGConfig()
    c.play_games = [GameConfig(g)
                    for g in "breakthrough reversi reversi_10x10".split()]
    return c


class GameMasterByGame(object):
    def __init__(self, game_config):
        assert isinstance(game_config, GameConfig)
        self.game_config = game_config

        self.gm = GameMaster(get_gdl_for_game(self.game_config.game_name))

        # add players
        puct_conf = self.get_puct_config()
        for role in self.gm.sm.get_roles():
            self.gm.add_player(cpuctplayer.CppPUCTPlayer(conf=puct_conf), role)

    def get_puct_config(self):
        conf = at.clone(cpuctplayer.compete)
        conf.generation = self.game_config.generation
        conf.choose = "choose_top_visits"

        multiplier = self.game_config.sims_multiplier
        if multiplier == 0:
            conf.playouts_per_iteration = 1
        else:
            conf.playouts_per_iteration *= multiplier
        return conf

    def get_move(self, str_state, lead_role_index):
        print "GameMasterByGame.get_move", str_state

        self.gm.reset()
        self.gm.start(meta_time=120, move_time=120,
                      initial_basestate=self.gm.convert_to_base_state(str_state))
        move = self.gm.play_single_move(last_move=None)
        return move[lead_role_index]


class LittleGolemConnection(object):
    def __init__(self, config):
        self.config = config
        self.games_by_gamemaster = {}

        for c in self.config.play_games:
            gm_by_game = GameMasterByGame(c)
            self.games_by_gamemaster[c.game_name] = gm_by_game

    def load_page(self, url):
        if not url.startswith("http://"):
            url = "http://www.littlegolem.net/" + url

        c = self.config
        req = urllib2.Request(url.replace(" ", "+"),
                              headers={"Cookie" : c.cookie})
        return urllib2.urlopen(req).read()

    def games_waiting(self):
        text = self.load_page("jsp/game/index.jsp")

        off1 = text.find("</i>On Move")
        off2 = text.find("</i>Opponent's Move")
        text = text[off1:off2]
        for s in re.findall(r"game.jsp\?gid=\d+", text):
            match_id = re.findall(r"\d+", s)[0]
            yield match_id

    def answer_invitation(self):
        print "checking invites"
        text = self.load_page("jsp/invitation/index.jsp")
        if "Refuse</a>" not in text:
            return False

        # get the first invite
        text = text[text.find("<td>Your decision</td>") : text.find("Refuse</a>")]
        invite_id = re.search(r'invid=(\d+)">Accept</a>', text).group(1)

        print "INVITATION", invite_id

        if "<td>Breakthrough :: Size 8</td>" in text:
            print "Accepting invitation to play breakthrough game"
            response = "accept"
        elif "<td>Reversi" in text:
            print "Accepting invitation to play reversi game"
            response = "accept"
        else:
            print "Refusing invitation to play game"
            print text
            response = "refuse"

        self.load_page("ng/a/Invitation.action?%s=&invid=%s" % (response,
                                                                invite_id))
        return True

    def play_move(self, game, *args):
        return self.games_by_gamemaster[game].get_move(*args)

    def handle_breakthrough(self, match_id, sgf, text):
        cords = []
        for s in re.findall(r"alt='\w*'", text):
            color = re.search(r"alt='(\w*)'", s).group(1)
            val = {"" : '0', "white" : '1', "black" : '2', "W" : '2', "B" : '1', "S" : '3'}[color]
            cords.append(val)

        assert len(cords) == 64
        print "handle_breakthrough", match_id, cords

        # group into rows
        rows = []
        for i in range(8):
            s, e = i * 8, (i + 1) * 8
            rows.append(cords[s:e])

        # get role to play, and rotate board (LG flips the board)
        if text.find("<b>g</b>") < text.find("<b>h</b>"):
            rows = [r[::-1] for r in rows[::-1]]
            our_role = "white"
            our_lead_role_index = 0
        else:
            our_role = "black"
            our_lead_role_index = 1

        print "role to play", our_role

        # convert to gdl trues string
        trues = []
        trues.append("(true (control %s))" % our_role)

        for y, row in enumerate(rows):
            for x, num in enumerate(row):
                if num == '0':
                    continue
                role = 'white' if num == '1' else 'black'
                trues.append("(true (cellHolds %s %s %s))" % (x + 1,
                                                              y + 1,
                                                              role))

        # actually play the move
        move = self.play_move("breakthrough", " ".join(trues), our_lead_role_index)
        print "move", move

        # convert to what little golem expects
        move = move.replace("(move", "").replace(")", "")
        a, b, c, d = move.split()
        a = 8 - int(a)
        b = int(b) - 1
        c = 8 - int(c)
        d = int(d) - 1
        return "%s%s%s%s" % (a, b, c, d)

    def handle_reversi(self, match_id, sgf, text):
        EMPTY, WHITE, BLACK = 0, 1, 2

        player_black = re.search(r"PB\[[a-zA-Z0-9_ ]*\]", sgf).group(0)[3:-1]
        player_white = re.search(r"PW\[[a-zA-Z0-9_ ]*\]", sgf).group(0)[3:-1]

        print player_black, player_white

        if player_black == self.config.whoami:
            our_role = "black"
            our_lead_role_index = 0
        else:
            our_role = "red"
            our_lead_role_index = 1

        print our_role, our_lead_role_index

        cords = []
        for line in text.splitlines():
            if "amazon/0.gif" in line:
                cords.append(EMPTY)
            elif "reversi/b.gif" in line:
                cords.append(BLACK)
            elif "reversi/w.gif" in line:
                cords.append(WHITE)

        # group into rows
        rows = []
        for i in range(8):
            s, e = i * 8, (i + 1) * 8
            rows.append(cords[s:e])
        pprint.pprint(rows)

        trues = []
        trues.append("(true (control %s))" % our_role)

        # weird GGP reversi implementation maps things differently:
        #   white -> red
        #   black -> black
        #   reflect rows

        for y, row in enumerate(rows):
            row = row[::-1]
            for x, what in enumerate(row):
                if what == EMPTY:
                    continue
                stone = 'black' if what == BLACK else 'red'
                trues.append("(true (cell %s %s %s))" % (x + 1,
                                                         y + 1,
                                                         stone))

        # actually play the move
        move = self.play_move("reversi", " ".join(trues), our_lead_role_index)
        move = move.replace("(move", "").replace(")", "")
        print "move", move

        # noop means pass in GGP
        if move == "noop":
            return "pass"

        # convert to what little golem expects
        a, b = move.split()
        a = "hgfedcba"[int(a) - 1]
        b = "abcdefgh"[int(b) - 1]
        return "%s%s" % (a, b)

    def handle_reversi_10x10(self, match_id, sgf, text):
        EMPTY, WHITE, BLACK = 0, 1, 2

        player_black = re.search(r"PB\[[a-zA-Z0-9_ ]*\]", sgf).group(0)[3:-1]
        player_white = re.search(r"PW\[[a-zA-Z0-9_ ]*\]", sgf).group(0)[3:-1]

        print player_black, player_white

        if player_black == self.config.whoami:
            our_role = "black"
            our_lead_role_index = 0
        else:
            our_role = "white"
            our_lead_role_index = 1

        print our_role, our_lead_role_index

        cords = []
        for line in text.splitlines():
            if "amazon/0.gif" in line:
                cords.append(EMPTY)
            elif "reversi/b.gif" in line:
                cords.append(BLACK)
            elif "reversi/w.gif" in line:
                cords.append(WHITE)

        # group into rows
        rows = []
        for i in range(10):
            s, e = i * 10, (i + 1) * 10
            rows.append(cords[s:e])
        pprint.pprint(rows)

        trues = []
        trues.append("(true (control %s))" % our_role)

        for y, row in enumerate(rows):
            for x, what in enumerate(row):
                if what == EMPTY:
                    continue
                stone = 'black' if what == BLACK else 'white'
                trues.append("(true (cell %s %s %s))" % (x + 1,
                                                         y + 1,
                                                         stone))

        # actually play the move
        move = self.play_move("reversi_10x10", " ".join(trues), our_lead_role_index)
        move = move.replace("(move", "").replace(")", "")
        print "move", move

        # noop means pass in GGP
        if move == "noop":
            return "pass"

        # convert to what little golem expects
        a, b = move.split()
        a = "abcdefghij"[int(a) - 1]
        b = "abcdefghij"[int(b) - 1]
        return "%s%s" % (a, b)

    def handle_game(self, match_id):
        print "Handling game %s" % match_id

        text = self.load_page("jsp/game/game.jsp?gid=" + match_id)

        # [note this may be different for different game, will need to fish for it in text XXX]
        orig_sgf = self.load_page("servlet/sgf/%s/game%s.txt" % (match_id, match_id))

        if "Breakthrough-Size 8" in text:
            move = self.handle_breakthrough(match_id, orig_sgf, text)

        elif "Reversi-Size 8x8" in text:
            move = self.handle_reversi(match_id, orig_sgf, text)

        elif "Reversi 10x10-Size 10x10" in text:
            move = self.handle_reversi_10x10(match_id, orig_sgf, text)

        else:
            assert False, "unknown game: '%s'" % text

        if self.config.dry_run:
            print "Would of sent", move
            sys.exit(0)

        # if the move is invalid, we wont get any indication of it.  Instead let's load the sgf.
        # If the game doesnt advance, abort.  This will stop us from hammering the server with
        # invalid moves, and probably causing a ban.
        print "sending move '%s' for match_id: %s" % (move, match_id)

        self.load_page("jsp/game/game.jsp?sendgame=%s&sendmove=%s" % (match_id, move))

        time.sleep(10)
        new_sgf = self.load_page("servlet/sgf/%s/game%s.txt" % (match_id, match_id))
        if new_sgf == orig_sgf:
            print "Game didn't advance on sending move.  Aborting."
            sys.exit(1)

    def loop_forever(self):
        sleep_time = 5
        last_answer_invites = time.time() - 1

        # forever:
        while True:
            if time.time() > last_answer_invites:
                last_answer_invites += 180

                while self.answer_invitation():
                    pass

            handled = False
            for match_id in self.games_waiting():
                handled = True
                sleep_time = 5
                self.handle_game(match_id)

            if not handled:
                # backoff, lets not hammer LG server
                sleep_time += 15
                if sleep_time > 60 * 2:
                    sleep_time = 60 * 2

            print "sleeping for %s seconds" % sleep_time
            time.sleep(sleep_time)


def setup():
    from ggplib.util.init import setup_once
    setup_once()

    from ggpzero.util.keras import init
    init()

    import tensorflow as tf
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    tf.logging.set_verbosity(tf.logging.ERROR)


if __name__ == "__main__":
    ''' to create a template config file, use -c config_filename.
        otherwise to run, provide the config_filename '''

    setup()

    if len(sys.argv) == 3:
        assert sys.argv[1] == "-c"
        conf_filename = sys.argv[2]
        with open(conf_filename, "w") as f:
            contents = at.attr_to_json(template_config(), pretty=True)
            f.write(contents)

    else:
        conf_filename = sys.argv[1]
        config = at.json_to_attr(open(conf_filename).read())
        lg = LittleGolemConnection(config)
        lg.loop_forever()
