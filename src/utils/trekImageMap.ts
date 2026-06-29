export const getTrekImage = (trekName: string) => {
  const name = trekName.toLowerCase();
  if (name.includes('kedarkantha')) return require('../assets/images/trek-images/Kedarkantha.jpg');
  if (name.includes('har ki dun')) return require('../assets/images/trek-images/Har Ki Dun.jpg');
  if (name.includes('dayara bugyal')) return require('../assets/images/trek-images/Dayara Bugyal.jpeg');
  if (name.includes('sandakphu') || name.includes('phalut')) return require('../assets/images/trek-images/Sandakphu Phalut.jpg');
  if (name.includes('roopkund')) return require('../assets/images/trek-images/Roopkund Trek.jpg');
  if (name.includes('goechala')) return require('../assets/images/trek-images/Goechala Trek.jpg');
  if (name.includes('hampta pass')) return require('../assets/images/trek-images/Hampta Pass.jpg');
  if (name.includes('bhrigu lake')) return require('../assets/images/trek-images/Bhrigu Lake.jpg');
  if (name.includes('brahmatal')) return require('../assets/images/trek-images/Brahmatal Trek.jpg');
  if (name.includes('buran ghati')) return require('../assets/images/trek-images/Buran Ghati.jpg');
  if (name.includes('chadar')) return require('../assets/images/trek-images/Chadar Trek.jpg');
  if (name.includes('kashmir great lakes')) return require('../assets/images/trek-images/Kashmir Great Lakes.jpg');
  if (name.includes('kuari pass')) return require('../assets/images/trek-images/Kuari Pass.jpeg');
  if (name.includes('markha valley')) return require('../assets/images/trek-images/Markha Valley.jpg');
  if (name.includes('pin parvati')) return require('../assets/images/trek-images/Pin Parvati Pass.jpg');
  if (name.includes('rupin pass')) return require('../assets/images/trek-images/Rupin Pass.jpg');
  if (name.includes('stok kangri')) return require('../assets/images/trek-images/Stok Kangri.jpg');
  if (name.includes('tarsar marsar')) return require('../assets/images/trek-images/Tarsar Marsar.jpg');
  if (name.includes('valley of flowers')) return require('../assets/images/trek-images/Valley of Flowers.jpg');
  if (name.includes('ali bedni')) return require('../assets/images/trek-images/Ali Bedni Bugyal.jpeg');
  
  // Default fallback
  return null;
};
