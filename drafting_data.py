# Commission data for the Drafting Room. Edit here, then run build_drafting.py
# status: draft | sent | viewed | won | passed

FIRM     = "Paris Pullen LLC"
CONTACT  = "hello@parispullen.com"
SUFFIX   = "e899d9"          # index URL suffix — change to rotate

BUILD_FEE = 1500             # one-time website build
CARE_FEE  = 50               # monthly management / maintenance

# Included in every build
FEATURES = [
    ("The site",        "A complete, responsive site — built, running and ready to hand over. Not a mockup."),
    ("Mobile first",    "Recomposed for phones rather than shrunk. Most of your traffic arrives that way."),
    ("Booking / contact","A working enquiry path so the site produces something, not just impressions."),
    ("Photography",     "Every image treated, cropped and compressed to load fast without looking cheap."),
    ("Search basics",   "Titles, descriptions, structured data and social preview cards done properly."),
    ("Speed",           "Responsive images, lazy loading and no framework weight. It opens immediately."),
    ("Accessibility",   "Keyboard navigation, real contrast, reduced-motion support."),
    ("Handover",        "Every file is yours. No lock-in, no proprietary builder, no monthly ransom."),
]

CARE = [
    "Two content updates a month — copy, images, prices, hours",
    "Hosting and SSL certificate",
    "Weekly backups",
    "Uptime monitoring and fixes if something breaks",
    "Cancel any month; the site and files remain yours",
]

COMMISSIONS = [
 dict(slug="goodwill-grooming", hexid="8e3eecdd",
      client="Goodwill Grooming", project="Barber &amp; Recording Artist",
      tagline="One man, two crafts, one room.",
      status="won", code="GOODWILL25",
      expires="2026-10-15T23:59:00-04:00",
      site="", preview="http://localhost:4350/goodwill-grooming/index.html", thumb="goodwill",
      stripe="",   # paste the Stripe Payment Link
      extras=["Booking flow built around the chair, not a generic calendar",
              "Music and barbering share a page without competing"],
      argument="A barber who records is not two businesses, and the site refuses to treat him as two. One room, one voice, two reasons to walk in.",
      note="Built and delivered. Domain registration still outstanding on their side."),

 dict(slug="threepiece-entertainment", hexid="6e47c4c8",
      client="Three Piece Entertainment", project="Live Music, Production &amp; Education",
      tagline="The proposal is the product.",
      status="won", code="3PE0825",
      expires="2026-12-31T23:59:00-05:00",
      site="", preview="http://localhost:4350/threepiece-entertainment/index.html", thumb="threepiece",
      stripe="",
      extras=["A proposal engine generating gated, expiring client documents",
              "Fourteen live proposals with access codes and tiered pricing",
              "A private index tracking every one"],
      argument="Most entertainment companies email a PDF. This one sends a private, expiring document with the client&#8217;s name on it and three priced options. It closes better because it behaves like the service it is selling.",
      note="The pattern the Drafting Room itself was modelled on."),

 dict(slug="your-new-nail-tech", hexid="cd3b2f98",
      client="Your New Nail Tech", project="Luxury Nail Artistry",
      tagline="Clean luxury, not clinical.",
      status="viewed", code="NAILTECH25",
      expires="2026-09-18T23:59:00-04:00",
      site="", preview="http://localhost:4350/your-new-nail-tech/index.html", thumb="nailtech",
      stripe="",
      extras=["Service and pricing structure laid out so clients self-qualify",
              "An identity that avoids both the clinical-white and heavy-glamour defaults"],
      argument="The category defaults to either clinical white or heavy glamour. This sits between them &#8212; restrained, expensive-feeling, and built so the work in the photographs is the loudest thing on the page.",
      note="Opened twice, no reply yet. Spotify ID and opening hours still unconfirmed."),

 dict(slug="burns-brims", hexid="e1fc3b5c",
      client="Burns &amp; Brims", project="Uncover Your Confidence",
      tagline="A hat is a decision.",
      status="draft", code="BRIMS0825",
      expires="2026-10-01T23:59:00-04:00",
      site="", preview="http://localhost:4350/burns-brims/index.html", thumb="burns",
      stripe="",
      extras=["Product photography treated as objects with weight and shadow",
              "Shop section &#8212; in progress"],
      argument="Millinery sells badly online because the photography usually flattens it. This build treats each piece as an object with weight and shadow rather than a flat product cut-out.",
      note="NOT YET PRESENTED. Finish the shop section before sending. Asset folder is 254MB &#8212; compress before deploy."),
]
