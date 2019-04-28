export type OnlineState = 'online' | 'offline';

export interface BulkTradeRequest {
  exchange: {
    account?: string;
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
  item: ItemDetails;
  listing: {
    account: AccountDetails;
    indexed: string;
    method: string;
    price: {
      amount: number;
      currency: string;
      type: string;
    };
    whisper: string;
  };
}


export interface ItemDetails {
  properties?: ItemProperty[];
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

export interface ItemProperty {
  displayMode: number;
  name: string;
  type: number;
  values: Array<string | number>[];
}
