
export type FullAnalysisParams = {
    gameString: string;
    moves: string;
    until: string;
    since: string;
    play: string;
};

export type FullAnalysisInputType = {
    id: string,
    gameString: string;
    moves: number;
    until: number;
    since: number;
    play: string;
};

export type FullAnalysisResultType = {
    gameString: string;
    play: string;
    masterGames: MasterGamePreview | null;
    otbStats: GameStats | null;
};
export type GameType = {
    archives: string[]
}

export type DbGameType = {
    id: string,
    site: string,
    game_date: string,
    round: string,
    white: string,
    black: string,
    result: string,
    ply_count: number,
    white_elo: number,
    white_fide_id: number,
    white_fide_title: string,
    black_elo: number,
    eco: string,
    source: string,
    source_quality: string,
    import_date: string,
    moves: string,
    game_pgn: string
}
export type Game = {
    id: string,
    url: string,
    time_control: string,
    end_time: number,
    rated: Boolean,
    time_class: TimeClass,
    rules: string,
    uuid: string,
    white: PlayerQuickInfo,
    black: PlayerQuickInfo,
    eco: string,
    initial_setup: string,
    fen: string,
    pgn: string
}

export type UserCheck = {
    username: string;
    email: string;
}
type PlayerQuickInfo = {
    rating: number,
    result: GameResult,
    username: string,
    uuid: string
}
export type TimeClass = "bullet" | "blitz" | "rapid" | "daily"

export type GameResult =
    | "win"
    | "checkmated"
    | "agreed"
    | "repetition"
    | "timeout"
    | "resigned"
    | "stalemate"
    | "lose"
    | "insufficient"
    | "50move"
    | "abandoned"
    | "kingofthehill"
    | "threecheck"
    | "timevsinsufficient"
    | "bughousepartnerlose";

export type Move = {
    moveNumber: number,
    whiteMove: String | null,
    blackMove: String | null
}

export type ChessVisionUser = {
    username: string,
    chessComUsername: string,
    email: string
}
export type player = {
    userName: string,
    chessId: string,
    profileLink: string,
    followers: number,
    country: string,
    league: string,
    playerStats: playerStats
}

export type playerStats = {
    overallWinRate: number,
    winRateAsWhite: number,
    winRateAsBlack: number,
    bestOpeningWinRate: number,
    rating: number,
    highestRating: number,
    highestRatingDate: string,
    puzzlesRating: number,
    peakPuzzleRush: number
}

export type GameStats = {
    games: number,
    white_wins: number,
    draws: number,
    black_wins: number
}

export type GameStatsQueryResponse = {
    result: string,
    count: string
}

export type LichessOpeningResponse = {
    white: number;
    draws: number;
    black: number;
    moves: LichessMove[];
};

export type LichessMove = {
    uci: string;
    san: string;
    averageRating: number;
    white: number;
    draws: number;
    black: number;
    game: unknown | null;
    opening: LichessOpening | null;
};

export type LichessOpening = {
    eco: string;
    name: string;
};

export type MasterGamePreview = {
    id: number;
    black_elo: number | null;
    white_elo: number | null;
    event: string | null;
    white: string;
    black: string;
};

export type ChessComProfile = {
    player_id: number;
    "@id": string;
    url: string;
    username: string;
    followers: number;
    country: string;
    last_online: number;
    joined: number;
    status: string;
    is_streamer: boolean;
    verified: boolean;
    league?: string;
    streaming_platforms?: unknown[];

    avatar?: string;
    name?: string;
    title?: string;
    location?: string;
};

export type ChessComRating = {
    rating: number;
    date: number;
    rd: number;
};

export type ChessComBestRating = {
    rating: number;
    date: number;
    game: string;
};

export type ChessComRecord = {
    win: number;
    loss: number;
    draw: number;
};

export type ChessComModeStats = {
    last: ChessComRating;
    best: ChessComBestRating;
    record: ChessComRecord;
};

export type ChessComDailyStats = {
    last: ChessComRating;
    best: ChessComBestRating;
    record: ChessComRecord & {
        time_per_move: number;
        timeout_percent: number;
    };
};

export type ChessComStats = {
    chess_daily?: ChessComDailyStats;
    chess_rapid?: ChessComModeStats;
    chess_bullet?: ChessComModeStats;
    chess_blitz?: ChessComModeStats;

    fide?: number;

    tactics?: {
        highest: {
            rating: number;
            date: number;
        };
        lowest: {
            rating: number;
            date: number;
        };
    };

    puzzle_rush?: {
        best: {
            total_attempts: number;
            score: number;
        };
    };
};

export type FullProfileResponse = {
    profile: ChessComProfile,
    stats: ChessComStats
}

export type Opening = {
    id: string;
    opening_class: "A" | "B" | "C" | "D" | "E";
    eco: string;
    name: string;
    pgn: string;
};


export type MovesPGN = {
    moves: string
}