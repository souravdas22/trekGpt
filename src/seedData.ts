import { getFirestore, collection, doc, setDoc } from '@react-native-firebase/firestore';
import { COLLECTIONS } from './services/firebase/collections';

const STORIES = [
  { id: '1', name: 'Tashi', avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', isOnline: true },
  { id: '2', name: 'Priya', avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', isOnline: true },
  { id: '3', name: 'Aman', avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', isOnline: false },
  { id: '4', name: 'Neha', avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', isOnline: true },
  { id: '5', name: 'Rohit', avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', isOnline: true },
];

const TRENDING_JOURNEYS = [
  {
    id: '1',
    title: 'Sandakphu Sunrise Magic',
    author: 'Tashi Sherpa',
    authorAvatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    duration: '6 Days',
    location: 'Sandakphu',
    description: 'The sunrise from Sandakphu was absolutely unreal.\nA dream come true! 🌅',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    likes: '124',
    comments: '24',
    views: '1.2K',
    imageCount: '1/10',
  },
  {
    id: '2',
    title: 'Valley of Flowers',
    author: 'Priya Sharma',
    authorAvatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    duration: '5 Days',
    location: 'Uttarakhand',
    description: 'Blooms everywhere! The colors are just mesmerizing. 🌺',
    image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    likes: '342',
    comments: '56',
    views: '3.4K',
    imageCount: '1/5',
  }
];

const POPULAR_CIRCLES = [
  { id: '1', name: 'West Bengal Trekkers', members: '8.2k', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', joined: false },
  { id: '2', name: 'Himalayan Explorers', members: '5.6k', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', joined: true },
  { id: '3', name: 'Backpackers India', members: '3.1k', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', joined: false },
];

const UPCOMING_EVENTS = [
  { id: '1', month: 'JUL', day: '12', weekday: 'SAT', type: 'MEETUP', title: 'Roopkund Trek Meetup', location: 'Uttarakhand', attendees: 48, extraAttendees: 43, image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', going: true },
  { id: '2', month: 'AUG', day: '05', weekday: 'MON', type: 'FESTIVAL', title: 'Trail Running Festival', location: 'Manali', attendees: 120, extraAttendees: 115, image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', going: false },
  { id: '3', month: 'JUL', day: '20', weekday: 'SAT', type: 'WORKSHOP', title: 'Beginner Hiking Day', location: 'Rishikesh', attendees: 35, extraAttendees: 30, image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', going: false },
];

const MY_CIRCLES_DATA = [
  { id: '1', name: 'Himalayan Trekkers', members: '4,820', type: 'High Altitude', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', extraMembers: 156 }
];

const DISCOVER_CIRCLES_DATA = [
  { id: '1', name: 'Weekend Hikers India', members: '2,310', type: 'Casual', description: 'Short hikes, local trails and weekend adventures across India.', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', extraMembers: 78, joined: false },
  { id: '2', name: 'Solo Trek Community', members: '1,540', type: 'Solo Travel', description: 'For solo trekkers to connect, share stories and find trail buddies.', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', extraMembers: 62, joined: true },
  { id: '3', name: 'Photography on Trails', members: '990', type: 'Photography', description: 'Capture the beauty of nature and share your best clicks.', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', extraMembers: 34, joined: false },
];

const FEATURED_JOURNEYS = [
  { id: '1', badgeType: 'editor', badgeText: "Editor's Pick", title: 'Har Ki Dun Trek', author: 'Tashi Sherpa', authorAvatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', duration: '7 Days', location: 'Uttarakhand', description: 'A memorable journey through the valley of Gods.', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', likes: '256', comments: '32', imageCount: '18' },
  { id: '2', badgeType: 'trending', badgeText: "Trending", title: 'Kedarkantha in Winter', author: 'Priya Negi', authorAvatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', duration: '6 Days', location: 'Uttarakhand', description: 'Snow, silence and stunning summits.', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', likes: '198', comments: '28', imageCount: '22' },
];

const JOURNEYS_LIST_DATA = [
  { id: '1', title: 'Sandakphu Trek', author: 'Rohit Sharma', isVerified: true, authorAvatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', duration: '5 Days', location: 'West Bengal', description: 'The sunrise at Sandakphu is something every trekker must experience once.', tags: [{ text: 'Beginner Friendly', type: 'beginner' }, { text: 'Great Views', type: 'views' }], price: '₹8,500', rating: '4.8', reviews: '86', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', imageCount: '12' },
  { id: '2', title: 'Valley of Flowers Trek', author: 'Neha Joshi', isVerified: true, authorAvatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', duration: '6 Days', location: 'Uttarakhand', description: 'A visual treat with colorful flowers and majestic landscapes.', tags: [{ text: 'Moderate', type: 'moderate' }, { text: 'Monsoon Trek', type: 'monsoon' }], price: '₹11,200', rating: '4.9', reviews: '112', image: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', imageCount: '16' },
];

const RECENT_ACHIEVEMENTS = [
  { id: '1', icon: 'terrain', label: 'Summit Seeker', sub: '10 Treks', color: '#4ADE80' },
  { id: '2', icon: 'shoe-print', label: 'Trail Master', sub: '100 km', color: '#38BDF8' },
  { id: '3', icon: 'camera-outline', label: 'Photo Explorer', sub: '50 Photos', color: '#D946EF' },
  { id: '4', icon: 'tent', label: 'Night Camper', sub: '5 Camps', color: '#F59E0B' },
  { id: '5', icon: 'leaf', label: 'Leave No Trace', sub: 'Eco Warrior', color: '#22C55E' },
];

export const seedStaticDataToFirestore = async () => {
  const db = getFirestore();
  
  console.log('Seeding Community Data...');
  
  const uploadArray = async (collectionName: string, data: any[]) => {
    for (const item of data) {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item, { merge: true });
    }
  };

  await uploadArray(COLLECTIONS.STORIES, STORIES);
  await uploadArray(COLLECTIONS.JOURNEYS, [...TRENDING_JOURNEYS.map(j => ({ ...j, group: 'trending' })), ...FEATURED_JOURNEYS.map(j => ({ ...j, group: 'featured' })), ...JOURNEYS_LIST_DATA.map(j => ({ ...j, group: 'list' }))]);
  await uploadArray(COLLECTIONS.CIRCLES, [...POPULAR_CIRCLES.map(c => ({ ...c, group: 'popular' })), ...MY_CIRCLES_DATA.map(c => ({ ...c, group: 'my' })), ...DISCOVER_CIRCLES_DATA.map(c => ({ ...c, group: 'discover' }))]);
  await uploadArray(COLLECTIONS.EVENTS, UPCOMING_EVENTS);
  await uploadArray(COLLECTIONS.ACHIEVEMENTS, RECENT_ACHIEVEMENTS);

  console.log('Community Data Seeding Complete!');
};
