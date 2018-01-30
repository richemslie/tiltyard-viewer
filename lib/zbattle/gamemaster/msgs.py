import attr

from ggpzero.util.attrutil import register_attrs

@register_attrs
class CanPlayGame(object):
    game = attr.ib("breakthrough")

    # can be empty for non-model players
    generations = attr.ib(default=attr.Factory(list))


@register_attrs
class RegisterPlayer(object):
    player_name = attr.ib("gurgeh")
    player_version = attr.ib("0.1-pre-alpha")

    # list of CanPlayGame
    games = attr.ib(default=attr.Factory(list))

    # if can play more than one game at a time
    # (must be the same game & generation)
    max_concurrent_games = attr.ib(1)


@register_attrs
class RegisterPlayerRequest(object):
    available_games = attr.ib(default=attr.Factory(list))


@register_attrs
class RegisterPlayerRequest(object):
    pass


@register_attrs
class PlayerReadyRequest(object):
    pass


@register_attrs
class PlayerReadyResponse(object):
    ready = attr.ib(False)


@register_attrs
class MatchStartNew(object):
    game = attr.ib("breakthrough")
    match_id = attr.ib("1234567890")

    # if have registed more than one model, will specifiy which modify to play with
    use_generation = attr.ib("v7_42")

    # for the ggp players
    gdl = attr.ib("(lots of gdl)")

    # list of participant players.  Always good to know who the opponents are (list of strings)
    participants = attr.ib(default=attr.Factory(list))

    # maximum time allowed to initialise before first move (allows for intialisation etc)
    start_time_initialise = attr.ib(60.0)

    # maximum time allowed for subsequent moves
    move_time = attr.ib(10.0)

    # empty means use the state machine's initial state state
    initial_game_state = attr.ib(default=attr.Factory(list))


@register_attrs
class MatchInitialised(object):
    match_id = attr.ib("1234567890")


@register_attrs
class MatchMoveRequest(object):
    game = attr.ib("breakthrough")
    match_id = attr.ib("1234567890")
    last_move = attr.ib(default=attr.Factory(list))


@register_attrs
class MatchMoveMade(object):
    game = attr.ib("hex")
    match_id = attr.ib("1234567890")
    move = attr.ib("(place f 4)")

    # any debug want to save
    debug = attr.ib("(place f 4)")


@register_attrs
class MatchEnd(object):
    game = attr.ib("breakthrough")
    match_id = attr.ib("1234567890")
    reason = attr.ib("game ended normally")


@register_attrs
class MatchEndResponse(object):
    match_id = attr.ib("1234567890")
