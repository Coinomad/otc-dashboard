export const manifest = {
  screens: {
    scr_kgnbaa: { name: "Login", route: "/login", position: { "x": 160, "y": 220 } },
    scr_dle7po: { name: "Sign Up", route: "/signup", position: { "x": 1560, "y": 220 } },
    scr_avm05d: { name: "Dashboard", route: "/", position: { "x": 160, "y": 2200 } },
    scr_kwk5us: { name: "Clients", route: "/clients", position: { "x": 160, "y": 4180 } },
    scr_q2kf09: { name: "Onboard New Client", route: "/clients/new", position: { "x": 1560, "y": 4180 } },
    scr_gy9948: { name: "Client Detail", route: "/clients/c_1", position: { "x": 2960, "y": 4180 } },
    scr_dvezcj: { name: "Settlement History", route: "/transactions", position: { "x": 160, "y": 6160 } },
    scr_8w8om6: { name: "Transaction Detail", route: "/transactions/tx_1000", position: { "x": 1560, "y": 6160 } },
    scr_jeph68: { name: "Rates", route: "/rates", position: { "x": 160, "y": 8140 } },
    scr_bod608: { name: "Settings", route: "/settings", position: { "x": 1560, "y": 8140 } }
  },
  sections: {
    sec_7wrl5r: { name: "Authentication", x: 0, y: 0, width: 2920, height: 1180 },
    sec_hgq8uv: { name: "Main Dashboard", x: 0, y: 1980, width: 1520, height: 1180 },
    sec_wv6ro2: { name: "Clients Management", x: 0, y: 3960, width: 4320, height: 1180 },
    sec_dtoxka: { name: "Transactions", x: 0, y: 5940, width: 2920, height: 1180 },
    sec_q6aa75: { name: "Settings & Configuration", x: 0, y: 7920, width: 2920, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_7wrl5r", children: [
    { kind: "screen", id: "scr_kgnbaa" },
    { kind: "screen", id: "scr_dle7po" }]
  },
  { kind: "section", id: "sec_hgq8uv", children: [
    { kind: "screen", id: "scr_avm05d" }]
  },
  { kind: "section", id: "sec_wv6ro2", children: [
    { kind: "screen", id: "scr_kwk5us" },
    { kind: "screen", id: "scr_q2kf09" },
    { kind: "screen", id: "scr_gy9948" }]
  },
  { kind: "section", id: "sec_dtoxka", children: [
    { kind: "screen", id: "scr_dvezcj" },
    { kind: "screen", id: "scr_8w8om6" }]
  },
  { kind: "section", id: "sec_q6aa75", children: [
    { kind: "screen", id: "scr_jeph68" },
    { kind: "screen", id: "scr_bod608" }]
  }]

};