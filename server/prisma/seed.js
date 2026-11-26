// Fills the database with the service catalogue and a few demo accounts.
// Run with: npm run seed   (it deletes the old data first)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/db');

const DEMO_PASSWORD = 'Fixit2026!';

const services = [
  { category: 'plumbing', name: 'Fix a leaking tap', description: 'Replace the washer or cartridge of one kitchen or bathroom tap.', fixedPriceUsd: 20, estMinutes: 45 },
  { category: 'plumbing', name: 'Unclog a sink or shower drain', description: 'Clear one blocked drain with a plunger or a drain snake.', fixedPriceUsd: 25, estMinutes: 45 },
  { category: 'plumbing', name: 'Install a water heater', description: 'Remove the old heater and connect a new one you already bought (up to 80 L).', fixedPriceUsd: 60, estMinutes: 120 },
  { category: 'electrical', name: 'Replace a socket or switch', description: 'Swap one faulty wall socket or light switch.', fixedPriceUsd: 15, estMinutes: 30 },
  { category: 'electrical', name: 'Install a ceiling fan or light', description: 'Mount and wire one ceiling fan or light fixture.', fixedPriceUsd: 35, estMinutes: 60 },
  { category: 'electrical', name: 'Connect a generator line', description: 'Wire the building generator subscription to your apartment panel.', fixedPriceUsd: 50, estMinutes: 90 },
  { category: 'ac', name: 'AC cleaning and service', description: 'Clean the filters and indoor unit of one split AC and check the gas pressure.', fixedPriceUsd: 25, estMinutes: 60 },
  { category: 'ac', name: 'AC gas refill', description: 'Find small leaks and refill the gas of one split AC unit.', fixedPriceUsd: 45, estMinutes: 60 },
  { category: 'ac', name: 'Install a split AC', description: 'Install one split AC unit (up to 18,000 BTU) with up to 3 m of piping.', fixedPriceUsd: 90, estMinutes: 180 },
  { category: 'carpentry', name: 'Fix a door or cabinet hinge', description: 'Realign or replace the hinges of one door or cabinet.', fixedPriceUsd: 20, estMinutes: 40 },
  { category: 'carpentry', name: 'Assemble furniture', description: 'Assemble one flat-pack item such as a wardrobe, bed or desk.', fixedPriceUsd: 35, estMinutes: 90 },
  { category: 'painting', name: 'Paint one room', description: 'Two coats on the walls of one room up to 15 m2. Paint not included.', fixedPriceUsd: 120, estMinutes: 360 },
  { category: 'painting', name: 'Fix wall cracks and damp spots', description: 'Fill, sand and repaint small cracks or damp patches on one wall.', fixedPriceUsd: 40, estMinutes: 120 },
];

const users = [
  { name: 'Maya Haddad', email: 'customer@fixit.test', role: 'customer', phone: '+961 70 111 222' },
  { name: 'Karim Saliba', email: 'plumber@fixit.test', role: 'pro', trade: 'plumbing', phone: '+961 71 333 444' },
  { name: 'Joe Khoury', email: 'electrician@fixit.test', role: 'pro', trade: 'electrical', phone: '+961 76 555 666' },
  { name: 'Hadi Nasser', email: 'ac@fixit.test', role: 'pro', trade: 'ac', phone: '+961 03 777 888' },
  { name: 'Elie Mrad', email: 'carpenter@fixit.test', role: 'pro', trade: 'carpentry', phone: '+961 81 999 000' },
  { name: 'Rami Aoun', email: 'painter@fixit.test', role: 'pro', trade: 'painting', phone: '+961 70 246 810' },
];

function daysFromNow(days, hour) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  // delete in this order because of the foreign keys
  await prisma.review.deleteMany();
  await prisma.job.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  await prisma.service.createMany({ data: services });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const created = {};
  for (const u of users) {
    created[u.email] = await prisma.user.create({ data: { ...u, passwordHash } });
  }

  const customer = created['customer@fixit.test'];
  const plumber = created['plumber@fixit.test'];
  const acPro = created['ac@fixit.test'];
  const tap = await prisma.service.findFirst({ where: { name: 'Fix a leaking tap' } });
  const acClean = await prisma.service.findFirst({ where: { name: 'AC cleaning and service' } });
  const drain = await prisma.service.findFirst({ where: { name: 'Unclog a sink or shower drain' } });

  // Two finished jobs with reviews, so the pro profiles show a rating
  const past = [
    { service: tap, pro: plumber, rating: 5, comment: 'On time and the tap has not dripped since.' },
    { service: acClean, pro: acPro, rating: 4, comment: 'Good work, arrived 15 minutes late.' },
  ];
  for (const p of past) {
    const job = await prisma.job.create({
      data: {
        customerId: customer.id,
        proId: p.pro.id,
        serviceId: p.service.id,
        address: 'Hamra Street, Beirut',
        lat: 33.8966,
        lng: 35.4823,
        scheduledAt: daysFromNow(-7, 10),
        description: 'Demo job from the seed script.',
        priceUsd: p.service.fixedPriceUsd,
        status: 'done',
      },
    });
    await prisma.review.create({ data: { jobId: job.id, rating: p.rating, comment: p.comment } });
  }

  // One open job, waiting for a plumber to accept it
  await prisma.job.create({
    data: {
      customerId: customer.id,
      serviceId: drain.id,
      address: 'Rue Monot, Achrafieh, Beirut',
      lat: 33.8886,
      lng: 35.5157,
      scheduledAt: daysFromNow(2, 9),
      description: 'The kitchen sink drains very slowly.',
      priceUsd: drain.fixedPriceUsd,
    },
  });

  console.log(`Seeded ${services.length} services and ${users.length} users (password: ${DEMO_PASSWORD})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
