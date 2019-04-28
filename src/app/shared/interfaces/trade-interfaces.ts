export type OnlineState = 'online' | 'offline';

export interface BulkTradeRequest {
  exchange: {
    status: {
      option: OnlineState
    },
    have: string[],
    want: string[],
  };
}

export interface TradeResponse {
  result: string[];
  id: string;
  total: number;
}

export interface TradeDetailsResponse {
  result: TradeDetails[];
}

export interface TradeDetails {
  id: string;
  account: AccountDetails;
  item: ItemDetails;
  source: {
    method: string;
    indexed: string;
    stash: {
      name: string;
      x: number;
      y: number;
    }
  };
  info: {
    price: {
      type: string;
      amount: number;
      currency: string;
    }
  };
}


export interface ItemDetails {
  verified: boolean;
  w: number;
  h: number;
  ilvl: number;
  icon: string;
  league: string;
  sockets: {
    group: number;
    attr: string;
  }[];
  name: string;
  typeLine: string;
  identified: boolean;
  corrupted: boolean;
  lockedToCharacter: boolean;
  note: string;
  requirements: {
    name: string;
    values: any[];
    displayMode: number;
  }[];
  implicitMods: string[];
  explicitMods: string[];
  flavourText: string[];
  frameType: number;
  extended: {
    hashed: {
      enchant: any[];
      implicit: string[];
      explicit: string[];
      crafted: any[];
    }
  };
}

export interface AccountDetails {
  name: string;
  lastCharacterName: string;
  online: {
    league: string;
  };
  language: string;
  whisper: string;
}
