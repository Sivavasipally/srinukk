// ============================================================
//  KK PICKLES - PRODUCT DATABASE
//  Sourced from KK_Pickle.xlsx
//  12 signature pickles · Tri-lingual (English / Hindi / Telugu)
// ============================================================
const PRODUCTS = [
  { id:'p1',  cat:'pickle', name:'Red Chilli Pickle',
    hi:'पांढु मिर्ची का अचार', tel:'పండు మిర్చి పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-red.svg',
    tags:['spicy','bestseller'] },

  { id:'p2',  cat:'pickle', name:'Gongura Pickle',
    hi:'गोंगूरा का अचार', tel:'గోంగూర పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-gongura.svg',
    tags:['signature','bestseller'] },

  { id:'p3',  cat:'pickle', name:'Ginger Pickle',
    hi:'अदरक का अचार', tel:'అల్లం పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-ginger.svg',
    tags:['digestive'] },

  { id:'p4',  cat:'pickle', name:'Tomato Pickle',
    hi:'टमाटर का अचार', tel:'టమోటా పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-tomato.svg',
    tags:['tangy'] },

  { id:'p5',  cat:'pickle', name:'Lemon Pickle',
    hi:'नींबू का अचार', tel:'నిమ్మకాయ పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-lemon.svg',
    tags:['tangy','bestseller'] },

  { id:'p6',  cat:'pickle', name:'Gooseberry Pickle',
    hi:'आंवला का अचार', tel:'ఉసిరికాయ పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-gooseberry.svg',
    tags:['healthy'] },

  { id:'p7',  cat:'pickle', name:'Mango Pickle (Avakaya)',
    hi:'आम का अचार', tel:'మామిడి అవకాయ',
    weight:'1 Kg', price:800, img:'images/pickle-mango.svg',
    tags:['signature','bestseller'] },

  { id:'p8',  cat:'pickle', name:'Mango Slices Pickle (Magaya)',
    hi:'आम के टुकड़ों का अचार', tel:'మాగాయ / మామిడి ముక్కల పచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-mango.svg',
    tags:['signature'] },

  { id:'p9',  cat:'pickle', name:'Mango Small Pieces Spicy Pickle',
    hi:'आम के छोटे टुकड़ों का मसालेदार अचार', tel:'మామిడి చిన్న ముక్కల తలింపుపచ్చడి',
    weight:'1 Kg', price:800, img:'images/pickle-mango.svg',
    tags:['spicy'] },

  { id:'p10', cat:'pickle', name:'Mango Jaggery Pickle',
    hi:'आम और गुड़ का अचार', tel:'మామిడి బెల్లం అవకాయ',
    weight:'1 Kg', price:800, img:'images/pickle-mango.svg',
    tags:['sweet-spicy','unique'] },

  { id:'p11', cat:'pickle', name:'Mango Moongdal Pickle',
    hi:'आम और मूँग दाल का आचार', tel:'మామిడి పెసర అవకాయ',
    weight:'1 Kg', price:800, img:'images/pickle-mango.svg',
    tags:['traditional'] },

  { id:'p12', cat:'pickle', name:'Mango Pulihora Pickle',
    hi:'आम पुलिहोरा अचार', tel:'మామిడి పులిహోర అవకాయ',
    weight:'1 Kg', price:800, img:'images/pickle-mango.svg',
    tags:['unique'] },
];

const CATEGORIES = [
  { id:'all',    label:'All Pickles',        icon:'✦',  tagline:'The complete collection' },
  { id:'pickle', label:'Signature Pickles',  icon:'🌶', tagline:'Handcrafted Andhra classics' },
];
