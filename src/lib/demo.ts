/**
 * Invented mail for the scenes. Every person, company, subject and address here is made up
 * (the same fictional Alex Morgan as the app's demo mode); nothing comes from a real mailbox.
 */

export type AccountId = "gmail" | "outlook" | "uni";

export interface Sender {
  name: string;
  email: string;
  /** A company sender: a solid tile in its color with its first letter, like a logo. */
  brand?: string;
}

export interface Row {
  id: string;
  from: Sender;
  /** The name column (several first names for a conversation). */
  label?: string;
  subject: string;
  snippet: string;
  count?: number;
  unread?: boolean;
  attachment?: boolean;
  priority?: boolean;
  account: AccountId;
  time: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  icon: CategoryIconName;
  hue: number;
  count: number;
  unread: number;
  description: string;
}

export type CategoryId = "invitations" | "notifications" | "codes" | "receipts" | "newsletters" | "ads";
export type CategoryIconName = "CalendarPlus" | "Bell" | "KeyRound" | "Receipt" | "Newspaper" | "Megaphone" | "Zap";

export interface Chip {
  id: string;
  from: Sender;
  unread?: boolean;
  code?: string;
}

const brand = (name: string, color: string, domain: string): Sender => ({
  name,
  email: `hello@${domain}.example`,
  brand: color,
});
const person = (name: string, email: string): Sender => ({ name, email });

export const B = {
  acme: brand("Acme", "#3fa34d", "acme"),
  northwindMarket: brand("Northwind Market", "#d4572a", "northwind"),
  northwindBank: brand("Northwind Bank", "#7aa37a", "northwindbank"),
  contoso: brand("Contoso ID", "#2f9e57", "contoso"),
  tailspin: brand("Tailspin Rides", "#3557c9", "tailspin"),
  globex: brand("Globex Pay", "#7bb33a", "globex"),
  cinema: brand("Cinema Orion", "#d08a2a", "cinemaorion"),
  acmeBilling: brand("Acme Billing", "#2f8fd8", "acmebilling"),
  fabrikam: brand("Fabrikam Support", "#c42a63", "fabrikam"),
  tally: brand("The Daily Tally", "#3a3fbf", "dailytally"),
  weekly: brand("Weekly Wrap", "#b03ac2", "weeklywrap"),
  field: brand("Field Notes", "#7bb33a", "fieldnotes"),
  career: brand("Career Center", "#57b33a", "university"),
  proseware: brand("Proseware Digest", "#3fa34d", "proseware"),
  litware: brand("Litware", "#2f6fd8", "litware"),
  adatum: brand("Adatum Cloud", "#3c63d6", "adatum"),
  trey: brand("Trey Research", "#a33fb0", "treyresearch"),
  coho: brand("Coho Winery", "#a8324a", "cohowinery"),
  wingtip: brand("Wingtip Toys", "#d9822b", "wingtiptoys"),
  fourth: brand("Fourth Coffee", "#6d4c2f", "fourthcoffee"),
  alpine: brand("Alpine Ski House", "#2a8fb5", "alpineskihouse"),
  harbor: brand("Harbor Meetup", "#3557c9", "harbormeetup"),
  pine: brand("Pine Street Co-op", "#3c3fc0", "pinestreet"),
  woodgrove: brand("Woodgrove Bank", "#3b7d4f", "woodgrove"),
  blueYonder: brand("Blue Yonder Air", "#2f7fd8", "blueyonder"),
  lucerne: brand("Lucerne Weekly", "#c2552f", "lucerne"),
  relecloud: brand("Relecloud", "#2a8fb5", "relecloud"),
  humongous: brand("Humongous Insurance", "#6b4fc4", "humongous"),
};

export const P = {
  marcus: person("Marcus Chen", "marcus.chen@studio.example"),
  priya: person("Priya Nair", "priya@lab.example"),
  dana: person("Dana Whitfield", "dana.w@mail.example"),
  noor: person("Noor Haddad", "noor@builds.example"),
  ravi: person("Ravi Menon", "ravi.menon@workshop.example"),
  miguel: person("Miguel Torres", "miguel@talent.example"),
  ana: person("Ana Lima", "ana.lima@studio.example"),
  jordan: person("Jordan Silva", "jordan@mail.example"),
  taylor: person("Taylor Brooks", "taylor.b@co.example"),
  sam: person("Sam Okafor", "sam.okafor@mail.example"),
};

export const CATEGORIES: Category[] = [
  {
    id: "invitations",
    name: "Invitations",
    icon: "CalendarPlus",
    hue: 265,
    count: 14,
    unread: 2,
    description:
      "Calendar invitations and event or meeting responses: someone inviting you, or answering an invitation you sent.",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: "Bell",
    hue: 150,
    count: 126,
    unread: 3,
    description:
      "Automated messages triggered by activity in an app or service: alerts, mentions, comments, sign-ins, status updates.",
  },
  {
    id: "codes",
    name: "Verification codes",
    icon: "KeyRound",
    hue: 35,
    count: 17,
    unread: 1,
    description:
      "Emails whose main purpose is delivering a one-time code or link so the reader can sign in or confirm an action.",
  },
  {
    id: "receipts",
    name: "Receipts",
    icon: "Receipt",
    hue: 95,
    count: 75,
    unread: 1,
    description:
      "Proof-of-purchase mail, tickets and package tracking updates: receipts, invoices, payment confirmations, order confirmations, subscription renewals and billing statements, refund confirmations, travel and events tickets and confirmations, updates on package tracking. They belong here even though they are automated. Do not include marketing about a purchase.",
  },
  {
    id: "newsletters",
    name: "Newsletters",
    icon: "Newspaper",
    hue: 210,
    count: 165,
    unread: 3,
    description:
      "Editorial mail whose content is news or reading: a newsletter, digest, blog post or column you subscribed to.",
  },
  {
    id: "ads",
    name: "Ads",
    icon: "Megaphone",
    hue: 340,
    count: 48,
    unread: 0,
    description:
      "Mail that tries to sell something or promote the sender's own company: sales, offers, launches, discounts.",
  },
];

export const CHIPS: Record<CategoryId, Chip[]> = {
  invitations: [
    { id: "i1", from: P.marcus },
    { id: "i2", from: P.priya, unread: true },
    { id: "i3", from: B.harbor, unread: true },
    { id: "i4", from: P.dana },
    { id: "i5", from: B.pine },
  ],
  notifications: [
    { id: "n1", from: B.litware, unread: true },
    { id: "n2", from: B.adatum },
    { id: "n3", from: B.trey, unread: true },
    { id: "n4", from: B.woodgrove },
    { id: "n5", from: B.northwindBank },
  ],
  codes: [
    { id: "c1", from: B.acme, unread: true, code: "482910" },
    { id: "c2", from: B.litware, code: "731204" },
    { id: "c3", from: B.contoso, code: "305118" },
    { id: "c4", from: B.tailspin, code: "874220" },
    { id: "c5", from: B.globex, code: "612907" },
  ],
  receipts: [
    { id: "r1", from: B.northwindMarket, unread: true },
    { id: "r2", from: B.cinema },
    { id: "r3", from: B.acmeBilling },
    { id: "r4", from: B.tailspin },
    { id: "r5", from: B.globex },
  ],
  newsletters: [
    { id: "w1", from: B.tally, unread: true },
    { id: "w2", from: B.weekly },
    { id: "w3", from: B.proseware, unread: true },
    { id: "w4", from: B.field, unread: true },
    { id: "w5", from: B.career },
  ],
  ads: [
    { id: "a1", from: B.wingtip },
    { id: "a2", from: B.coho },
    { id: "a3", from: B.alpine },
    { id: "a4", from: B.fourth },
    { id: "a5", from: B.blueYonder },
  ],
};

export const PINNED: Row = {
  id: "pin",
  from: P.noor,
  label: "Noor, Alex",
  subject: "Kitchen renovation quote",
  snippet: "Good afternoon, thanks for the quick reply. Attached is the revised quote with the island, and the tiles you picked.",
  count: 3,
  account: "gmail",
  time: "Nov 18",
};

export const YESTERDAY: Row[] = [
  {
    id: "y1",
    from: B.northwindMarket,
    label: "Alex, Northwind",
    subject: "Refund request | Case 48213",
    snippet: "Hi Alex, thank you for the receipt. Your refund was approved and should reach your card in three to five days.",
    count: 12,
    priority: true,
    account: "gmail",
    time: "Nov 23",
  },
];

export const LAST_WEEK: Row[] = [
  {
    id: "l1",
    from: P.ravi,
    subject: "Draft agenda for Thursday's workshop",
    snippet: "Hi Alex and Priya, I'm attaching the draft agenda for Thursday's workshop, with the two sessions we talked about.",
    attachment: true,
    account: "uni",
    time: "Nov 20",
  },
  {
    id: "l2",
    from: B.fabrikam,
    subject: "Order #77194 is delayed",
    snippet: "Hi Alex, thanks for your reply. Please note that we cannot find a tracking number for your order yet.",
    account: "gmail",
    time: "Nov 18",
  },
  {
    id: "l3",
    from: P.miguel,
    subject: "Staff engineer role on the platform team",
    snippet: "Hi Alex, your open source work caught my eye. We are hiring a staff engineer for the platform team.",
    account: "outlook",
    time: "Nov 17",
  },
  {
    id: "l4",
    from: P.jordan,
    label: "Alex, Jordan, Casey +1",
    subject: "Automatic reply: Workshop logistics",
    snippet: "Hello, thank you for your email. I am out of the office until Monday, November 30, with limited access.",
    count: 4,
    account: "gmail",
    time: "Nov 16",
  },
  {
    id: "l5",
    from: P.taylor,
    label: "Alex, Taylor",
    subject: "Action needed: update your billing details",
    snippet: "Hi Alex, good afternoon, I believe it's only a small update to the account records before the renewal.",
    count: 2,
    account: "uni",
    time: "Nov 13",
  },
];

/** What arrives in the hero, one after another: where it is filed, or `null` when it stays in the list. */
export interface Arrival {
  row: Row;
  to: CategoryId | null;
  code?: string;
}

export const ARRIVALS: Arrival[] = [
  {
    to: "newsletters",
    row: {
      id: "x1",
      from: B.lucerne,
      subject: "Tuesday: the week in eleven charts",
      snippet: "Good morning. Rates held, the rail strike ended, and a very small dog won a very big prize.",
      unread: true,
      account: "gmail",
      time: "9:41",
    },
  },
  {
    to: null,
    row: {
      id: "x2",
      from: P.priya,
      label: "Priya Nair",
      subject: "Re: Workshop venue",
      snippet: "The east hall is free on Thursday from two. Shall I book it for the four of us?",
      unread: true,
      account: "uni",
      time: "9:44",
    },
  },
  {
    to: "codes",
    code: "590316",
    row: {
      id: "x3",
      from: B.relecloud,
      subject: "Your sign-in code",
      snippet: "Use 590316 to sign in. It expires in ten minutes. If this wasn't you, you can ignore this email.",
      unread: true,
      account: "outlook",
      time: "9:47",
    },
  },
  {
    to: "receipts",
    row: {
      id: "x4",
      from: B.wingtip,
      subject: "Your order is on its way",
      snippet: "Order #20417: two items shipped today. Track your package with the number below.",
      unread: true,
      account: "gmail",
      time: "9:52",
    },
  },
  {
    to: "notifications",
    row: {
      id: "x5",
      from: B.humongous,
      subject: "Your policy documents are ready",
      snippet: "Your renewed home policy is ready to view. Nothing changes in your cover this year.",
      unread: true,
      account: "outlook",
      time: "9:55",
    },
  },
  {
    to: null,
    row: {
      id: "x6",
      from: P.marcus,
      label: "Marcus Chen",
      subject: "Dinner on Friday?",
      snippet: "We found a new place by the river. Eight o'clock works for Sam and me, does it work for you?",
      unread: true,
      account: "gmail",
      time: "10:02",
    },
  },
];
