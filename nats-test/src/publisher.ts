import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';
console.clear();

const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

const events = [
  'football match',
  'concert',
  'art exhibition',
  'car race',
  'food event',
  'netsec event',
];

const ticketTypes = [
  'popular ticket',
  'exclusive access',
  'meet & greet',
  'all access'
];

const getRandomFromArray = (list: string[]): string => {
  const total = list.length;
  const random = Math.floor(Math.random() * total);

  return list[random];
}

const camelize = (text: string): string => {
  return text.split(' ').map(t => {
    const newText = t.replace(/^(.)/g, (letter) => letter.toUpperCase());
    return newText;
  }).join(' ');
}

const getRandomPrice = (): number => {
  return parseFloat((Math.random() * (10000 - 1000) + 1000).toFixed(2));
}

stan.on('connect', async () => {
  console.log('publisher connected to NATS');
  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: (+Date.now()).toString(),
      title: `${camelize(getRandomFromArray(events))} - ${camelize(getRandomFromArray(ticketTypes))} - ${new Date().toLocaleDateString('en')}`,
      price: getRandomPrice(),
    });
  } catch (err) {
    console.error(err);
  }
  
});