// ===== START CUT: components/sections/About.jsx =====
function AboutSection() {
  const { bg, surface, text, text2, text3 } = useTheme()
  const stats = [{ value: '50+', label: 'Rooms & Cottages' }, { value: '10K+', label: 'Happy Guests' }, { value: '8', label: 'Years of Service' }, { value: '4.9', label: 'Customer Rating' }]
  const features = [
    { icon: <ILeaf />, title: 'Nature-Inspired Design', desc: "Architecture seamlessly woven into Palawan's lush tropical landscape." },
    { icon: <IBed />, title: 'Rooms & Cottages', desc: 'Premium, Deluxe, Solo, Family, and Couple accommodations for every guest.' },
    { icon: <ISpa />, title: 'Restaurant & Venues', desc: 'Signature dining and event spaces for gatherings, weddings, and celebrations.' },
    { icon: <IIsland />, title: 'Island Experience', desc: 'Discover pristine beaches, crystal waters, and guided island adventures.' },
  ]

  return (
    <section id="about" className="py-20 lg:py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={POOL_IMG} alt="Palawan Paraíso pool" className="w-full h-80 lg:h-[460px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-44 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-white hidden lg:block">
              <img src={BEACH_IMG} alt="Palawan beach" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="lg:pl-4">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>About Us</p>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-5" style={{ fontFamily: "'Playfair Display', serif", color: text }}>Welcome to<br />Palawan Paraíso</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: text2 }}>Nestled on the pristine shores of Palawan, the Philippines' last frontier, Palawan Paraíso Resort &amp; Spa is a sanctuary where luxury meets nature. Since 2016, we have been the premier destination for travellers seeking an unparalleled island escape.</p>
            <p className="text-sm leading-relaxed mb-8" style={{ color: text2 }}>From Premium and Deluxe rooms to Family and Couple cottages, our signature restaurant, versatile event venues, and curated island experiences — every detail has been thoughtfully crafted to ensure your stay is nothing short of extraordinary.</p>
            <div className="grid grid-cols-2 gap-4 mb-10">
              {features.map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0" style={{ color: GREEN }}>{f.icon}</div>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{ color: text }}>{f.title}</p>
                    <p className="text-[11px] leading-relaxed" style={{ color: text3 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(s => (
                <div key={s.label} className="text-center rounded-xl py-3 px-2" style={{ background: surface }}>
                  <p className="text-xl font-bold" style={{ color: GREEN, fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
                  <p className="text-[9px] mt-0.5 leading-tight font-medium" style={{ color: text2 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Gallery & Review data per item ──────────────────────────────────────────
const ITEM_GALLERIES = {
  premium:         ['https://images.unsplash.com/photo-1731336478850-6bce7235e320?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1587985064135-0366536eab42?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=900&h=600&fit=crop'],
  deluxe:          ['https://images.unsplash.com/photo-1774280954999-9758f11f3d41?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&h=600&fit=crop'],
  solo:            ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop'],
  family:          ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&h=600&fit=crop'],
  couple:          ['https://images.unsplash.com/photo-1559599101-f09722fb4948?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=900&h=600&fit=crop'],
  'premium-cottage':['https://images.unsplash.com/photo-1669123547602-46e60bf0eb72?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=900&h=600&fit=crop'],
  'open-deluxe':   ['https://images.unsplash.com/photo-1710563138874-4bac91c14e51?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&h=600&fit=crop'],
  'deluxe-cottage':['https://images.unsplash.com/photo-1689132097047-319d66354205?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1515263487990-61b07816b324?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1464146072230-91cabc968266?w=900&h=600&fit=crop'],
  'solo-cottage':  ['https://images.unsplash.com/photo-1689308608685-27085e11e640?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900&h=600&fit=crop'],
  'family-cottage':['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&h=600&fit=crop'],
  'couple-cottage':['https://images.unsplash.com/photo-1689308608672-511decc38722?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1534595038511-9f219fe0c979?w=900&h=600&fit=crop'],
  breakfast:       ['https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=900&h=600&fit=crop'],
  lunch:           ['https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1544025162-d76694265947?w=900&h=600&fit=crop'],
  dinner:          ['https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1559847844-5315695dadae?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1600891964092-4316c288032e?w=900&h=600&fit=crop'],
  'open-space':    ['https://images.unsplash.com/photo-1600540520314-cbc1ddc91f3b?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&h=600&fit=crop'],
  'covered-hall':  ['https://images.unsplash.com/photo-1763616349199-3f753df17883?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1478147427282-58a87a5acbed?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&h=600&fit=crop'],
  'sports-center': ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&h=600&fit=crop'],
  'sports-field':  ['https://images.unsplash.com/photo-1723713297155-12f305c78462?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1551958219-acbc595d6e64?w=900&h=600&fit=crop','https://images.unsplash.com/photo-1540747913346-19212a4b423e?w=900&h=600&fit=crop'],
}

const ITEM_REVIEWS = {
  premium: [
    { name: 'Maria Santos', rating: 5, date: 'March 2025', avatar: 'MS', comment: 'Absolutely breathtaking! The jacuzzi with ocean views was unreal. We will definitely be back for our anniversary.' },
    { name: 'James Reyes', rating: 5, date: 'January 2025', avatar: 'JR', comment: 'The service matched the incredible views. Every detail felt luxurious. Worth every peso.' },
    { name: 'Ana Cruz', rating: 4, date: 'December 2024', avatar: 'AC', comment: 'Stunning room and amazing staff. The balcony sunsets were something else entirely.' },
  ],
  deluxe: [
    { name: 'Carlo Mendoza', rating: 5, date: 'February 2025', avatar: 'CM', comment: 'Waking up to the garden every morning was so peaceful. Clean, comfortable, and beautifully designed.' },
    { name: 'Lia Torres', rating: 4, date: 'November 2024', avatar: 'LT', comment: 'Great value for the price. The garden view from bed is stunning. Mini bar was well-stocked.' },
  ],
  solo: [
    { name: 'Ben Lim', rating: 5, date: 'April 2025', avatar: 'BL', comment: 'Perfect for solo travel. Quiet, cozy, and everything I needed. The work desk was a nice touch.' },
    { name: 'Sofia Tan', rating: 4, date: 'March 2025', avatar: 'ST', comment: 'Clean and comfortable. Great WiFi for remote work. Will definitely return.' },
  ],
  family: [
    { name: 'The Dela Cruz Family', rating: 5, date: 'April 2025', avatar: 'DC', comment: 'The kids loved the garden terrace! Plenty of space for all 6 of us. Staff was incredibly helpful.' },
    { name: 'Rosa Aquino', rating: 5, date: 'February 2025', avatar: 'RA', comment: 'Spacious and comfortable for our whole family. The kitchen made breakfast mornings so easy.' },
  ],
  couple: [
    { name: 'Marco & Isla', rating: 5, date: 'March 2025', avatar: 'MI', comment: 'The romantic setup was perfect for our honeymoon. Ocean views from bed — absolutely dreamy.' },
    { name: 'Javier Ramos', rating: 5, date: 'January 2025', avatar: 'JR', comment: 'Surprised my wife here for our anniversary. She cried happy tears. The resort exceeded every expectation.' },
  ],
  'premium-cottage': [
    { name: 'Diego Flores', rating: 5, date: 'April 2025', avatar: 'DF', comment: 'Having a private pool all to ourselves was incredible. The BBQ area made our evenings perfect.' },
    { name: 'Camille Reyes', rating: 5, date: 'March 2025', avatar: 'CR', comment: 'Stunning cottage with impeccable privacy. Felt like our own private island resort.' },
  ],
  'open-deluxe': [
    { name: 'Nathan Park', rating: 4, date: 'February 2025', avatar: 'NP', comment: 'The open-air design was refreshing and unique. Ocean breeze all day. A real gem.' },
    { name: 'Hannah Lee', rating: 5, date: 'January 2025', avatar: 'HL', comment: 'Waking up to the breeze and panoramic views — nothing compares. Absolutely loved it.' },
  ],
  'deluxe-cottage': [
    { name: 'Petra Santos', rating: 5, date: 'March 2025', avatar: 'PS', comment: 'The tropical garden setting made every moment magical. Great kitchenette for morning coffee.' },
    { name: 'Ray Villanueva', rating: 4, date: 'February 2025', avatar: 'RV', comment: 'Comfortable and private. The terrace was our favourite spot to relax in the evenings.' },
  ],
  'solo-cottage': [
    { name: 'Yuki Tanaka', rating: 5, date: 'April 2025', avatar: 'YT', comment: 'Perfect solo retreat. The hammock in the private garden was where I spent most of my time.' },
  ],
  'family-cottage': [
    { name: 'The Batungbakal Family', rating: 5, date: 'March 2025', avatar: 'TB', comment: 'Huge space for our big family. The large terrace was our dining room every evening. Perfect.' },
    { name: 'Grace Lim', rating: 4, date: 'December 2024', avatar: 'GL', comment: 'Enough room for everyone. Kids loved the garden. Will book again for the holidays.' },
  ],
  'couple-cottage': [
    { name: 'Alicia & Paolo', rating: 5, date: 'February 2025', avatar: 'AP', comment: 'The outdoor bath surrounded by tropical flowers was the most romantic experience of our lives.' },
    { name: 'Tanya Go', rating: 5, date: 'January 2025', avatar: 'TG', comment: 'So secluded and intimate. The private garden with blooming flowers was breathtaking.' },
  ],
  breakfast: [
    { name: 'Leo Bautista', rating: 5, date: 'April 2025', avatar: 'LB', comment: 'Best breakfast spread I have ever had at a resort. The tropical fruits were so fresh and delicious.' },
    { name: 'Mia Santos', rating: 4, date: 'March 2025', avatar: 'MS', comment: 'Great variety with Filipino and international options. Coffee was excellent.' },
  ],
  lunch: [
    { name: 'Chris Navarro', rating: 5, date: 'March 2025', avatar: 'CN', comment: 'The seafood at lunch was incredibly fresh. Kinilaw and grilled fish were absolutely divine.' },
    { name: 'Karen Uy', rating: 5, date: 'February 2025', avatar: 'KU', comment: 'Loved the traditional Filipino spread. Every dish was bursting with flavor and love.' },
  ],
  dinner: [
    { name: 'Paolo Herrera', rating: 5, date: 'April 2025', avatar: 'PH', comment: 'Dinner under the stars with the finest seafood. This was the highlight of our entire trip.' },
    { name: 'Isabel Ramos', rating: 5, date: 'March 2025', avatar: 'IR', comment: 'Romantic and refined. The food quality rivaled top Manila restaurants. Truly exceptional.' },
    { name: 'Marcus Tan', rating: 4, date: 'January 2025', avatar: 'MT', comment: 'Great atmosphere and flavors. The grilled lobster was the best I have ever tasted.' },
  ],
  'open-space': [
    { name: 'Wedding Planner PH', rating: 5, date: 'March 2025', avatar: 'WP', comment: 'Hosted a 300-guest garden wedding here. The scenic backdrop was everything our couple dreamed of.' },
    { name: 'Events by Claudia', rating: 5, date: 'February 2025', avatar: 'EC', comment: 'Stunning venue. The resort team was professional and accommodating throughout the event.' },
  ],
  'covered-hall': [
    { name: 'Samantha Diaz', rating: 5, date: 'April 2025', avatar: 'SD', comment: 'Perfect for our corporate event. Sound system was excellent and the LED lighting made it magical.' },
    { name: 'Reunion Group 2025', rating: 5, date: 'March 2025', avatar: 'RG', comment: 'Air-conditioning was great, stage setup was professional. Highly recommend for large gatherings.' },
  ],
  'sports-center': [
    { name: 'Coach Rivera', rating: 5, date: 'February 2025', avatar: 'CR', comment: 'Top-notch indoor courts and equipment. Perfect for our team tournament. Staff was very helpful.' },
    { name: 'Active Palawan', rating: 4, date: 'January 2025', avatar: 'AP', comment: 'Clean facilities with great locker rooms. Spectator seating was comfortable and well-positioned.' },
  ],
  'sports-field': [
    { name: 'Team Katipunan', rating: 5, date: 'March 2025', avatar: 'TK', comment: 'Night lighting made our evening tournament so much fun. The field is well-maintained and spacious.' },
    { name: 'Events Manila', rating: 4, date: 'February 2025', avatar: 'EM', comment: 'Great open-air venue. Bleachers provided good visibility for spectators. Easy parking too.' },
  ],
}

// ─── Unit occupancy data ──────────────────────────────────────────────────────
const AVAIL_TODAY = '2026-09-20' // today
const BADGE_DATE = '2026-09-21'

function isUnitOccupied(bookings, ds) {
  return bookings.some(b => ds >= b.from && ds < b.to)
}

const ITEM_UNITS = {
  premium: { unitType: 'room', units: [
    { label: 'Room 1', bookings: [{ from: '2026-09-19', to: '2026-09-23' }, { from: '2026-10-01', to: '2026-10-04' }] },
    { label: 'Room 2', bookings: [{ from: '2026-09-20', to: '2026-09-26' }] },
    { label: 'Room 3', bookings: [{ from: '2026-09-25', to: '2026-09-29' }] },
    { label: 'Room 4', bookings: [{ from: '2026-10-02', to: '2026-10-06' }] },
  ]},
  deluxe: { unitType: 'room', units: [
    { label: 'Room 1', bookings: [{ from: '2026-09-18', to: '2026-09-22' }] },
    { label: 'Room 2', bookings: [{ from: '2026-09-19', to: '2026-09-24' }] },
    { label: 'Room 3', bookings: [{ from: '2026-09-20', to: '2026-09-23' }] },
    { label: 'Room 4', bookings: [{ from: '2026-09-20', to: '2026-09-27' }] },
    { label: 'Room 5', bookings: [{ from: '2026-09-27', to: '2026-10-01' }] },
    { label: 'Room 6', bookings: [] },
  ]},
  solo: { unitType: 'room', units: [
    { label: 'Room 1', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Room 2', bookings: [{ from: '2026-09-22', to: '2026-09-24' }] },
    { label: 'Room 3', bookings: [] },
    { label: 'Room 4', bookings: [] },
    { label: 'Room 5', bookings: [{ from: '2026-09-28', to: '2026-10-01' }] },
    { label: 'Room 6', bookings: [] },
    { label: 'Room 7', bookings: [] },
    { label: 'Room 8', bookings: [] },
  ]},
  family: { unitType: 'room', units: [
    { label: 'Room 1', bookings: [{ from: '2026-09-19', to: '2026-09-23' }] },
    { label: 'Room 2', bookings: [{ from: '2026-09-20', to: '2026-09-25' }] },
    { label: 'Room 3', bookings: [] },
  ]},
  couple: { unitType: 'room', units: [
    { label: 'Room 1', bookings: [{ from: '2026-09-18', to: '2026-09-22' }] },
    { label: 'Room 2', bookings: [{ from: '2026-09-19', to: '2026-09-24' }] },
    { label: 'Room 3', bookings: [{ from: '2026-09-20', to: '2026-09-26' }] },
    { label: 'Room 4', bookings: [] },
  ]},
  'premium-cottage': { unitType: 'cottage', units: [
    { label: 'Cottage 1', bookings: [{ from: '2026-09-20', to: '2026-09-24' }] },
    { label: 'Cottage 2', bookings: [] },
    { label: 'Cottage 3', bookings: [{ from: '2026-09-25', to: '2026-09-28' }] },
  ]},
  'open-deluxe': { unitType: 'cottage', units: [
    { label: 'Cottage 1', bookings: [{ from: '2026-09-19', to: '2026-09-22' }] },
    { label: 'Cottage 2', bookings: [{ from: '2026-09-20', to: '2026-09-23' }] },
    { label: 'Cottage 3', bookings: [] },
    { label: 'Cottage 4', bookings: [] },
  ]},
  'deluxe-cottage': { unitType: 'cottage', units: [
    { label: 'Cottage 1', bookings: [{ from: '2026-09-21', to: '2026-09-25' }] },
    { label: 'Cottage 2', bookings: [] },
    { label: 'Cottage 3', bookings: [] },
    { label: 'Cottage 4', bookings: [] },
    { label: 'Cottage 5', bookings: [] },
  ]},
  'solo-cottage': { unitType: 'cottage', units: [
    { label: 'Cottage 1', bookings: [] },
    { label: 'Cottage 2', bookings: [] },
    { label: 'Cottage 3', bookings: [{ from: '2026-09-23', to: '2026-09-26' }] },
    { label: 'Cottage 4', bookings: [] },
    { label: 'Cottage 5', bookings: [] },
    { label: 'Cottage 6', bookings: [] },
  ]},
  'family-cottage': { unitType: 'cottage', units: [
    { label: 'Cottage 1', bookings: [{ from: '2026-09-19', to: '2026-09-23' }] },
    { label: 'Cottage 2', bookings: [{ from: '2026-09-20', to: '2026-09-24' }] },
    { label: 'Cottage 3', bookings: [] },
  ]},
  'couple-cottage': { unitType: 'cottage', units: [
    { label: 'Cottage 1', bookings: [{ from: '2026-09-20', to: '2026-09-25' }] },
    { label: 'Cottage 2', bookings: [{ from: '2026-09-19', to: '2026-09-22' }] },
    { label: 'Cottage 3', bookings: [{ from: '2026-09-20', to: '2026-09-26' }] },
    { label: 'Cottage 4', bookings: [{ from: '2026-09-20', to: '2026-09-24' }] },
  ]},
  breakfast: { unitType: 'table', units: [
    { label: 'Table S-1', group: 'Solo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table S-2', group: 'Solo', bookings: [{ from: '2026-09-22', to: '2026-09-23' }] },
    { label: 'Table S-3', group: 'Solo', bookings: [] },
    { label: 'Table S-4', group: 'Solo', bookings: [] },
    { label: 'Table D-1', group: 'Duo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table D-2', group: 'Duo', bookings: [] },
    { label: 'Table D-3', group: 'Duo', bookings: [] },
    { label: 'Table Q-1', group: 'Squad', bookings: [] },
    { label: 'Table Q-2', group: 'Squad', bookings: [] },
  ]},
  lunch: { unitType: 'table', units: [
    { label: 'Table S-1', group: 'Solo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table S-2', group: 'Solo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table S-3', group: 'Solo', bookings: [] },
    { label: 'Table S-4', group: 'Solo', bookings: [] },
    { label: 'Table D-1', group: 'Duo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table D-2', group: 'Duo', bookings: [] },
    { label: 'Table D-3', group: 'Duo', bookings: [] },
    { label: 'Table Q-1', group: 'Squad', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table Q-2', group: 'Squad', bookings: [] },
  ]},
  dinner: { unitType: 'table', units: [
    { label: 'Table S-1', group: 'Solo', bookings: [] },
    { label: 'Table S-2', group: 'Solo', bookings: [] },
    { label: 'Table S-3', group: 'Solo', bookings: [] },
    { label: 'Table S-4', group: 'Solo', bookings: [] },
    { label: 'Table D-1', group: 'Duo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table D-2', group: 'Duo', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table D-3', group: 'Duo', bookings: [] },
    { label: 'Table Q-1', group: 'Squad', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Table Q-2', group: 'Squad', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
  ]},
  'open-space': { unitType: 'venue', units: [
    { label: 'Open Lawn', bookings: [{ from: '2026-09-22', to: '2026-09-23' }] },
  ]},
  'covered-hall': { unitType: 'hall', units: [
    { label: 'Hall A', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Hall B', bookings: [] },
  ]},
  'sports-center': { unitType: 'court', units: [
    { label: 'Court 1', bookings: [{ from: '2026-09-20', to: '2026-09-21' }] },
    { label: 'Court 2', bookings: [] },
    { label: 'Court 3', bookings: [] },
  ]},
  'sports-field': { unitType: 'field', units: [
    { label: 'Field 1', bookings: [] },
    { label: 'Field 2', bookings: [] },
    { label: 'Field 3', bookings: [] },
  ]},
}

function getAvailInfo(itemId) {
  const cfg = ITEM_UNITS[itemId]
  if (!cfg) return { label: 'Available', status: 'Available' }
  const avail = cfg.units.filter(u => !isUnitOccupied(u.bookings, BADGE_DATE)).length
  const total = cfg.units.length
  if (avail === 0) return { label: 'Full', status: 'Full' }
  if (avail === total) return { label: 'Available', status: 'Available' }
  const t = cfg.unitType
  return { label: `${avail} ${t}${avail !== 1 ? 's' : ''} left`, status: avail / total <= 0.4 ? 'Limited' : 'Available' }
}

function getAvailableUnitsForRange(itemId, from, to) {
  const cfg = ITEM_UNITS[itemId]
  if (!cfg || !from || !to) return cfg?.units ?? []
  return cfg.units.filter(u => !u.bookings.some(b => b.from < to && b.to > from))
}

function AvailabilityCalendar({ itemId }) {
  const cfg = ITEM_UNITS[itemId]
  if (!cfg) return null
  const { dm, surface, border, text, text2, text3 } = useTheme()

  // Assign a distinct palette per unit so overlapping events are distinguishable
  const unitColors = ['#38875C', '#2563EB', '#D97706', '#9333EA', '#DB2777', '#0891B2', '#DC2626', '#65A30D', '#EA580C', '#7C3AED']

  const events = useMemo(() => cfg.units.flatMap((unit, idx) =>
    unit.bookings.map(b => ({
      title: unit.group ? `${unit.label} · ${unit.group}` : unit.label,
      start: b.from,
      end: b.to,
      backgroundColor: unitColors[idx % unitColors.length],
      borderColor: unitColors[idx % unitColors.length],
      textColor: '#fff',
      extendedProps: { unit: unit.label, group: unit.group },
    }))
  ), [itemId])

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: text3 }}>Availability Calendar</p>
      <div className={`rounded-xl overflow-hidden fc-resort${dm ? ' fc-resort-dark' : ''}`} style={{ background: surface, border: `1px solid ${border}` }}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate={AVAIL_TODAY}
          events={events}
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          height="auto"
          dayMaxEvents={3}
          eventDisplay="block"
          fixedWeekCount={false}
          showNonCurrentDates={false}
          dayCellClassNames={info => info.dateStr === AVAIL_TODAY ? ['fc-resort-today'] : []}
        />
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5" style={{ borderTop: `1px solid ${border}` }}>
          {cfg.units.map((unit, idx) => (
            <div key={unit.label} className="flex items-center gap-1.5">
              <div className="rounded-sm w-2.5 h-2.5 shrink-0" style={{ background: unitColors[idx % unitColors.length] }} />
              <span className="text-[9px]" style={{ color: text2 }}>{unit.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CardDetailModal({ item, onClose, onReserve }) {
  const { card, surface, border, text, text2, text3 } = useTheme()
  const [photoIdx, setPhotoIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const photos = ITEM_GALLERIES[item.id] ?? [item.img]
  const reviews = ITEM_REVIEWS[item.id] ?? []
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0

  function Stars({ n, size = 12 }) {
    return (
      <span className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <svg key={i} width={size} height={size} viewBox="0 0 12 12" fill={i <= n ? GOLD : 'none'} stroke={i <= n ? GOLD : '#D1D5DB'} strokeWidth="1">
            <path d="M6 1l1.3 2.7 3 .4-2.2 2.1.5 3L6 7.8 3.4 9.2l.5-3L1.7 4.1l3-.4z" />
          </svg>
        ))}
      </span>
    )
  }

  return (
    <>
    {lightboxOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.93)' }} onClick={() => setLightboxOpen(false)}>
        <img src={photos[photoIdx]} alt="" className="rounded-lg object-contain" style={{ maxWidth: '95vw', maxHeight: '90vh' }} />
        <button className="absolute top-4 right-4 rounded-full flex items-center justify-center text-white text-sm" style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)' }} onClick={() => setLightboxOpen(false)}>✕</button>
        {photos.length > 1 && <>
          <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)' }}>
            <svg viewBox="0 0 12 12" fill="none" className="w-4 h-4"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>}
        <div className="absolute bottom-4 text-white/70 text-xs">{photoIdx + 1} / {photos.length}</div>
      </div>
    )}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col" style={{ background: card, border: `1px solid ${border}`, maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>

        {/* Main photo — click to view full */}
        <div className="relative shrink-0 cursor-zoom-in" style={{ height: 260 }} onClick={() => setLightboxOpen(true)}>
          <img src={photos[photoIdx]} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
          {/* Close */}
          <button onClick={onClose} className="absolute top-3 right-3 rounded-full text-white flex items-center justify-center transition-colors hover:bg-black/40" style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.35)' }}>✕</button>
          {/* Availability + price */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <AvailBadge status={item.availability} />
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {reviews.length > 0 && <><Stars n={Math.round(avgRating)} /><span className="text-white/80 text-[10px]">{avgRating.toFixed(1)} ({reviews.length})</span></>}
                <span className="flex items-center gap-1 text-white/70 text-[10px]"><IUsers />{item.capacity} pax</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">{peso(item.price)}</p>
              <p className="text-white/65 text-[10px]">per {item.priceUnit}</p>
            </div>
          </div>
          {/* Photo nav arrows */}
          {photos.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i - 1 + photos.length) % photos.length) }} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white transition-colors hover:bg-black/50" style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.35)' }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); setPhotoIdx(i => (i + 1) % photos.length) }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-white transition-colors hover:bg-black/50" style={{ width: 30, height: 30, background: 'rgba(0,0,0,0.35)' }}>
              <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </>}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex gap-1.5 px-4 pt-3 shrink-0">
            {photos.map((p, i) => (
              <button key={i} onClick={() => setPhotoIdx(i)} className="rounded-lg overflow-hidden shrink-0 transition-all" style={{ width: 54, height: 38, outline: i === photoIdx ? `2px solid ${GREEN}` : '2px solid transparent', opacity: i === photoIdx ? 1 : 0.6 }}>
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            <div className="flex-1" />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: text2 }}>{item.desc}</p>
            {/* Amenities */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: text3 }}>Amenities</p>
              <div className="flex flex-wrap gap-1.5">
                {item.amenities.map(a => (
                  <span key={a} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: surface, color: text2, border: `1px solid ${border}` }}>{a}</span>
                ))}
              </div>
            </div>
            {/* Availability calendar */}
            <AvailabilityCalendar itemId={item.id} />
            {/* Reviews */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: text3 }}>
                Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
              </p>
              {reviews.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: text3 }}>No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {/* Rating summary */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: surface }}>
                    <div className="text-center">
                      <p className="text-4xl font-bold" style={{ color: text, fontFamily: "'Playfair Display', serif" }}>{avgRating.toFixed(1)}</p>
                      <Stars n={Math.round(avgRating)} size={14} />
                      <p className="text-[10px] mt-1" style={{ color: text3 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 space-y-1">
                      {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length
                        const pct = reviews.length ? (count / reviews.length) * 100 : 0
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-[10px] w-2" style={{ color: text3 }}>{star}</span>
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: border }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: GOLD }} />
                            </div>
                            <span className="text-[10px] w-4 text-right" style={{ color: text3 }}>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Individual reviews */}
                  {reviews.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: surface, border: `1px solid ${border}` }}>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${GREEN}, #2a6647)` }}>{r.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="text-xs font-semibold" style={{ color: text }}>{r.name}</p>
                            <p className="text-[10px] shrink-0" style={{ color: text3 }}>{r.date}</p>
                          </div>
                          <Stars n={r.rating} size={11} />
                          <p className="text-xs mt-2 leading-relaxed" style={{ color: text2 }}>{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer action */}
        <div className="px-4 py-3 flex gap-2 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full text-xs font-medium border transition-colors" style={{ borderColor: border, color: text2 }}>Close</button>
          <button onClick={() => { onClose(); onReserve() }} className="flex-1 py-2.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: GREEN }}>Reserve Now</button>
        </div>
      </div>
    </div>
    </>
  )
}

// ─── Catalogue ────────────────────────────────────────────────────────────────
function AvailBadge({ status, label }) {
  const colors = {
    Available: { bg: '#DCFCE7', text: '#16A34A' },
    Limited: { bg: '#FEF9C3', text: '#CA8A04' },
    Full: { bg: '#FEE2E2', text: '#DC2626' },
  }
  const c = colors[status]
  return <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.text }}>{label ?? status}</span>
}

function CatalogueCard({ img, name, desc, price, priceUnit, capacity, amenities, availability, availLabel, onReserve, onViewDetails }) {
  const { card, text, text2, text3, border } = useTheme()
  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col" style={{ background: card, border: `1px solid ${border}` }}>
      <div className="relative h-48 overflow-hidden shrink-0" style={{ background: '#1a2e1f' }}>
        <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3"><AvailBadge status={availability} label={availLabel} /></div>
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs font-semibold" style={{ background: GREEN }}>
          {peso(price)}<span className="font-normal opacity-80">/{priceUnit}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>{name}</h3>
          <span className="flex items-center gap-1 text-[10px] mt-0.5 shrink-0 ml-2" style={{ color: text3 }}><IUsers />{capacity}</span>
        </div>
        <p className="text-[11px] leading-relaxed mb-3 flex-1" style={{ color: text2 }}>{desc}</p>
        <div className="flex flex-wrap gap-1 mb-4">{amenities.slice(0, 4).map(a => <Chip key={a} label={a} />)}</div>
        <div className="flex gap-2">
          <button onClick={onViewDetails} className="flex-1 py-2 rounded-full text-xs font-medium border transition-colors hover:opacity-80" style={{ borderColor: border, color: text2 }}>View Details</button>
          <button onClick={onReserve} className="flex-1 py-2 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90" style={{ background: GREEN }}>Reserve</button>
        </div>
      </div>
    </div>
  )
}


function CatalogueSection({ onReserve }) {
  const { surface, card, text, text2, border } = useTheme()
  const [activeTab, setActiveTab] = useState('rooms')
  const [detailItem, setDetailItem] = useState(null)

  const tabs = [
    { id: 'rooms', label: 'Rooms', count: ROOMS.length },
    { id: 'cottages', label: 'Cottages', count: COTTAGES.length },
    { id: 'restaurant', label: 'Restaurant', count: RESTAURANT_MEALS.length },
    { id: 'venues', label: 'Venues', count: VENUES.length },
  ]

  function openDetail(item) { setDetailItem(item) }

  return (
    <section id="catalogue" className="py-20 lg:py-28" style={{ background: surface }}>
      {detailItem && (
        <CardDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onReserve={() => { setDetailItem(null); onReserve(detailItem.category, detailItem.id) }}
        />
      )}
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: GOLD }}>Catalogue</p>
          <h2 className="text-4xl lg:text-5xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: text }}>What We Offer</h2>
          <p className="text-sm mt-3 max-w-xl mx-auto leading-relaxed" style={{ color: text2 }}>Explore our full range of accommodations, dining, and event spaces. Everything you need for the perfect Palawan experience.</p>
        </div>
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shrink-0"
              style={{ background: activeTab === tab.id ? GREEN : card, color: activeTab === tab.id ? 'white' : text2, boxShadow: activeTab === tab.id ? `0 2px 12px ${GREEN}33` : `0 1px 4px rgba(0,0,0,0.06)`, border: `1px solid ${activeTab === tab.id ? 'transparent' : border}` }}>
              {tab.label}
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : border, color: activeTab === tab.id ? 'white' : text2 }}>{tab.count}</span>
            </button>
          ))}
        </div>
        {activeTab === 'rooms' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROOMS.map(r => { const av = getAvailInfo(r.id); return <CatalogueCard key={r.id} img={r.img} name={r.name} desc={r.desc} price={r.price} priceUnit="night" capacity={r.capacity} amenities={r.amenities} availability={av.status} availLabel={av.label} onReserve={() => onReserve('room', r.id)} onViewDetails={() => openDetail({ id: r.id, name: r.name, img: r.img, desc: r.desc, price: r.price, priceUnit: 'night', capacity: r.capacity, amenities: r.amenities, availability: av.status, category: 'room' })} /> })}
          </div>
        )}
        {activeTab === 'cottages' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COTTAGES.map(c => { const av = getAvailInfo(c.id); return <CatalogueCard key={c.id} img={c.img} name={c.name} desc={c.desc} price={c.price} priceUnit="night" capacity={c.capacity} amenities={c.amenities} availability={av.status} availLabel={av.label} onReserve={() => onReserve('cottage', c.id)} onViewDetails={() => openDetail({ id: c.id, name: c.name, img: c.img, desc: c.desc, price: c.price, priceUnit: 'night', capacity: c.capacity, amenities: c.amenities, availability: av.status, category: 'cottage' })} /> })}
          </div>
        )}
        {activeTab === 'restaurant' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {RESTAURANT_MEALS.map(m => { const av = getAvailInfo(m.id); return <CatalogueCard key={m.id} img={m.img} name={m.meal} desc={`${m.time} · ${m.desc}`} price={m.price} priceUnit="pax" capacity={m.capacity} amenities={['Breakfast', 'Set Menu', 'À la Carte', 'Buffet']} availability={av.status} availLabel={av.label} onReserve={() => onReserve('restaurant', m.id)} onViewDetails={() => openDetail({ id: m.id, name: m.meal, img: m.img, desc: `${m.time} · ${m.desc}`, price: m.price, priceUnit: 'pax', capacity: m.capacity, amenities: ['Breakfast', 'Set Menu', 'À la Carte', 'Buffet'], availability: av.status, category: 'restaurant' })} /> })}
          </div>
        )}
        {activeTab === 'venues' && (
          <div className="grid sm:grid-cols-2 gap-6">
            {VENUES.map(v => { const av = getAvailInfo(v.id); return <CatalogueCard key={v.id} img={v.img} name={v.name} desc={v.desc} price={v.price} priceUnit="event" capacity={v.capacity} amenities={v.amenities} availability={av.status} availLabel={av.label} onReserve={() => onReserve('venue', v.id)} onViewDetails={() => openDetail({ id: v.id, name: v.name, img: v.img, desc: v.desc, price: v.price, priceUnit: 'event', capacity: v.capacity, amenities: v.amenities, availability: av.status, category: 'venue' })} /> })}
          </div>
        )}
      </div>
    </section>
  )
}