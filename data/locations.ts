export interface Country {
  name: string
  flag?: string
  states?: string[]
  cities?: string[]
}

export const africanCountries: Country[] = [
  {
    name: 'Nigeria',
    flag: '🇳🇬',
    states: [
      'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
      'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
      'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
      'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
      'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
    ]
  },
  {
    name: 'Algeria',
    flag: '🇩🇿',
    cities: ['Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra']
  },
  {
    name: 'Angola',
    flag: '🇦🇴',
    cities: ['Luanda', 'Huambo', 'Lobito', 'Benguela', 'Kuito', 'Lubango', 'Malanje', 'Namibe', 'Soyo', 'Cabinda']
  },
  {
    name: 'Benin',
    flag: '🇧🇯',
    cities: ['Cotonou', 'Porto-Novo', 'Parakou', 'Djougou', 'Bohicon', 'Kandi', 'Abomey', 'Natitingou', 'Lokossa', 'Ouidah']
  },
  {
    name: 'Botswana',
    flag: '🇧🇼',
    cities: ['Gaborone', 'Francistown', 'Molepolole', 'Maun', 'Serowe', 'Selibe Phikwe', 'Kanye', 'Mochudi', 'Mahalapye', 'Palapye']
  },
  {
    name: 'Burkina Faso',
    flag: '🇧🇫',
    cities: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Ouahigouya', 'Banfora', 'Dédougou', 'Kaya', 'Fada N\'gourma', 'Tenkodogo', 'Houndé']
  },
  {
    name: 'Burundi',
    flag: '🇧🇮',
    cities: ['Bujumbura', 'Gitega', 'Muyinga', 'Ngozi', 'Ruyigi', 'Kayanza', 'Bururi', 'Makamba', 'Rutana', 'Cibitoke']
  },
  {
    name: 'Cameroon',
    flag: '🇨🇲',
    cities: ['Douala', 'Yaoundé', 'Garoua', 'Bamenda', 'Bafoussam', 'Maroua', 'Nkongsamba', 'Kumba', 'Buea', 'Limbe']
  },
  {
    name: 'Cape Verde',
    flag: '🇨🇻',
    cities: ['Praia', 'Mindelo', 'Santa Maria', 'Assomada', 'São Filipe', 'Pedra Badejo', 'Tarrafal', 'Porto Novo', 'Ribeira Grande', 'Espargos']
  },
  {
    name: 'Central African Republic',
    flag: '🇨🇫',
    cities: ['Bangui', 'Bimbo', 'Berbérati', 'Carnot', 'Bambari', 'Bouar', 'Bossangoa', 'Bozoum', 'Sibut', 'Nola']
  },
  {
    name: 'Chad',
    flag: '🇹🇩',
    cities: ['N\'Djamena', 'Moundou', 'Sarh', 'Abéché', 'Kélo', 'Koumra', 'Pala', 'Am Timan', 'Bongor', 'Mongo']
  },
  {
    name: 'Comoros',
    flag: '🇰🇲',
    cities: ['Moroni', 'Mutsamudu', 'Fomboni', 'Domoni', 'Tsimbeo', 'Mitsoudjé', 'Ouani', 'Sima', 'Mirontsi', 'Bambao']
  },
  {
    name: 'Congo (Brazzaville)',
    flag: '🇨🇬',
    cities: ['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Owando', 'Ouesso', 'Madingou', 'Gamboma', 'Impfondo', 'Sibiti']
  },
  {
    name: 'Congo (Kinshasa)',
    flag: '🇨🇩',
    cities: ['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Goma', 'Bukavu', 'Tshikapa', 'Kolwezi', 'Likasi']
  },
  {
    name: 'Djibouti',
    flag: '🇩🇯',
    cities: ['Djibouti City', 'Ali Sabieh', 'Tadjoura', 'Obock', 'Dikhil', 'Arta', 'Holhol', 'Loyada', 'Balho', 'Galafi']
  },
  {
    name: 'Egypt',
    flag: '🇪🇬',
    cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta']
  },
  {
    name: 'Equatorial Guinea',
    flag: '🇬🇶',
    cities: ['Malabo', 'Bata', 'Ebebiyin', 'Aconibe', 'Añisoc', 'Luba', 'Evinayong', 'Mongomo', 'Mengomeyén', 'Rebola']
  },
  {
    name: 'Eritrea',
    flag: '🇪🇷',
    cities: ['Asmara', 'Keren', 'Massawa', 'Assab', 'Mendefera', 'Barentu', 'Adi Keyh', 'Adi Quala', 'Dekemhare', 'Teseney']
  },
  {
    name: 'Eswatini',
    flag: '🇸🇿',
    cities: ['Mbabane', 'Manzini', 'Big Bend', 'Malkerns', 'Nhlangano', 'Siteki', 'Piggs Peak', 'Lobamba', 'Hluti', 'Kwaluseni']
  },
  {
    name: 'Ethiopia',
    flag: '🇪🇹',
    cities: ['Addis Ababa', 'Dire Dawa', 'Mekelle', 'Gondar', 'Adama', 'Hawassa', 'Bahir Dar', 'Dessie', 'Jimma', 'Jijiga']
  },
  {
    name: 'Gabon',
    flag: '🇬🇦',
    cities: ['Libreville', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné', 'Tchibanga', 'Koulamoutou', 'Makokou']
  },
  {
    name: 'Gambia',
    flag: '🇬🇲',
    cities: ['Banjul', 'Serekunda', 'Brikama', 'Bakau', 'Farafenni', 'Lamin', 'Sukuta', 'Gunjur', 'Basse Santa Su', 'Soma']
  },
  {
    name: 'Ghana',
    flag: '🇬🇭',
    cities: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Ashaiman', 'Tema', 'Teshie', 'Cape Coast', 'Obuasi', 'Sunyani']
  },
  {
    name: 'Guinea',
    flag: '🇬🇳',
    cities: ['Conakry', 'Nzérékoré', 'Kankan', 'Kindia', 'Labé', 'Guéckédou', 'Siguiri', 'Kissidougou', 'Macenta', 'Mamou']
  },
  {
    name: 'Guinea-Bissau',
    flag: '🇬🇼',
    cities: ['Bissau', 'Bafatá', 'Gabú', 'Bissorã', 'Bolama', 'Cacheu', 'Catió', 'Canchungo', 'Farim', 'Mansôa']
  },
  {
    name: 'Ivory Coast',
    flag: '🇨🇮',
    cities: ['Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Man', 'Divo', 'Gagnoa', 'Abengourou']
  },
  {
    name: 'Kenya',
    flag: '🇰🇪',
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Ruiru', 'Kikuyu', 'Thika', 'Malindi', 'Naivasha']
  },
  {
    name: 'Lesotho',
    flag: '🇱🇸',
    cities: ['Maseru', 'Teyateyaneng', 'Mafeteng', 'Hlotse', 'Mohale\'s Hoek', 'Maputsoe', 'Qacha\'s Nek', 'Quthing', 'Butha-Buthe', 'Mokhotlong']
  },
  {
    name: 'Liberia',
    flag: '🇱🇷',
    cities: ['Monrovia', 'Gbarnga', 'Kakata', 'Bensonville', 'Harper', 'Voinjama', 'Buchanan', 'Zwedru', 'New Yekepa', 'Ganta']
  },
  {
    name: 'Libya',
    flag: '🇱🇾',
    cities: ['Tripoli', 'Benghazi', 'Misrata', 'Bayda', 'Zawiya', 'Ajdabiya', 'Tobruk', 'Sabha', 'Derna', 'Zliten']
  },
  {
    name: 'Madagascar',
    flag: '🇲🇬',
    cities: ['Antananarivo', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Mahajanga', 'Toliara', 'Antsiranana', 'Ambovombe', 'Manakara', 'Morondava']
  },
  {
    name: 'Malawi',
    flag: '🇲🇼',
    cities: ['Lilongwe', 'Blantyre', 'Mzuzu', 'Zomba', 'Kasungu', 'Mangochi', 'Karonga', 'Salima', 'Liwonde', 'Dedza']
  },
  {
    name: 'Mali',
    flag: '🇲🇱',
    cities: ['Bamako', 'Sikasso', 'Mopti', 'Koutiala', 'Kayes', 'Ségou', 'Gao', 'Kati', 'Tombouctou', 'Kidal']
  },
  {
    name: 'Mauritania',
    flag: '🇲🇷',
    cities: ['Nouakchott', 'Nouadhibou', 'Néma', 'Kaédi', 'Rosso', 'Zouérat', 'Kiffa', 'Atar', 'Sélibaby', 'Aleg']
  },
  {
    name: 'Mauritius',
    flag: '🇲🇺',
    cities: ['Port Louis', 'Beau Bassin-Rose Hill', 'Vacoas-Phoenix', 'Curepipe', 'Quatre Bornes', 'Triolet', 'Goodlands', 'Centre de Flacq', 'Mahebourg', 'Saint Pierre']
  },
  {
    name: 'Morocco',
    flag: '🇲🇦',
    cities: ['Casablanca', 'Rabat', 'Fes', 'Marrakech', 'Tangier', 'Salé', 'Meknes', 'Oujda', 'Kenitra', 'Agadir']
  },
  {
    name: 'Mozambique',
    flag: '🇲🇿',
    cities: ['Maputo', 'Matola', 'Nampula', 'Beira', 'Chimoio', 'Nacala', 'Quelimane', 'Tete', 'Lichinga', 'Pemba']
  },
  {
    name: 'Namibia',
    flag: '🇳🇦',
    cities: ['Windhoek', 'Rundu', 'Walvis Bay', 'Oshakati', 'Swakopmund', 'Katima Mulilo', 'Grootfontein', 'Rehoboth', 'Otjiwarongo', 'Okahandja']
  },
  {
    name: 'Niger',
    flag: '🇳🇪',
    cities: ['Niamey', 'Zinder', 'Maradi', 'Agadez', 'Tahoua', 'Dosso', 'Diffa', 'Arlit', 'Tessaoua', 'Birni N\'Konni']
  },
  {
    name: 'Rwanda',
    flag: '🇷🇼',
    cities: ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Byumba', 'Cyangugu', 'Kibungo', 'Kibuye', 'Rwamagana']
  },
  {
    name: 'São Tomé and Príncipe',
    flag: '🇸🇹',
    cities: ['São Tomé', 'Santo António', 'Trindade', 'Neves', 'Santana', 'Guadalupe', 'Santa Cruz', 'Pantufo', 'São João dos Angolares', 'Porto Alegre']
  },
  {
    name: 'Senegal',
    flag: '🇸🇳',
    cities: ['Dakar', 'Touba', 'Thiès', 'Kaolack', 'Saint-Louis', 'Ziguinchor', 'Mbour', 'Diourbel', 'Rufisque', 'Louga']
  },
  {
    name: 'Seychelles',
    flag: '🇸🇨',
    cities: ['Victoria', 'Anse Boileau', 'Beau Vallon', 'Cascade', 'Takamaka', 'Anse Royale', 'Baie Lazare', 'Grand Anse', 'Bel Ombre', 'Port Glaud']
  },
  {
    name: 'Sierra Leone',
    flag: '🇸🇱',
    cities: ['Freetown', 'Bo', 'Kenema', 'Koidu', 'Makeni', 'Lunsar', 'Port Loko', 'Waterloo', 'Kabala', 'Magburaka']
  },
  {
    name: 'Somalia',
    flag: '🇸🇴',
    cities: ['Mogadishu', 'Hargeisa', 'Bosaso', 'Kismayo', 'Berbera', 'Merca', 'Galcaio', 'Baidoa', 'Burao', 'Garowe']
  },
  {
    name: 'South Africa',
    flag: '🇿🇦',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley']
  },
  {
    name: 'South Sudan',
    flag: '🇸🇸',
    cities: ['Juba', 'Malakal', 'Wau', 'Yei', 'Bor', 'Yambio', 'Aweil', 'Bentiu', 'Rumbek', 'Torit']
  },
  {
    name: 'Sudan',
    flag: '🇸🇩',
    cities: ['Khartoum', 'Omdurman', 'Khartoum North', 'Port Sudan', 'Kassala', 'Nyala', 'El Obeid', 'Kosti', 'Wad Medani', 'El Fasher']
  },
  {
    name: 'Tanzania',
    flag: '🇹🇿',
    cities: ['Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Mbeya', 'Morogoro', 'Tanga', 'Zanzibar City', 'Kigoma', 'Moshi']
  },
  {
    name: 'Togo',
    flag: '🇹🇬',
    cities: ['Lomé', 'Sokodé', 'Kara', 'Kpalimé', 'Atakpamé', 'Dapaong', 'Tsévié', 'Aného', 'Sansanné-Mango', 'Bassar']
  },
  {
    name: 'Tunisia',
    flag: '🇹🇳',
    cities: ['Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous']
  },
  {
    name: 'Uganda',
    flag: '🇺🇬',
    cities: ['Kampala', 'Gulu', 'Lira', 'Mbarara', 'Jinja', 'Bwizibwera', 'Mbale', 'Mukono', 'Kasese', 'Masaka']
  },
  {
    name: 'Zambia',
    flag: '🇿🇲',
    cities: ['Lusaka', 'Kitwe', 'Ndola', 'Kabwe', 'Chingola', 'Mufulira', 'Livingstone', 'Luanshya', 'Kasama', 'Chipata']
  },
  {
    name: 'Zimbabwe',
    flag: '🇿🇼',
    cities: ['Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru', 'Epworth', 'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi']
  }
]

// Phone format information for countries
interface PhoneInfo {
  format: string
  example: string
}

const countryPhoneInfo: Record<string, PhoneInfo> = {
  'Nigeria': { format: '+234 XXX XXX XXXX', example: '+234 803 123 4567' },
  'South Africa': { format: '+27 XX XXX XXXX', example: '+27 82 123 4567' },
  'Kenya': { format: '+254 XXX XXX XXX', example: '+254 712 345 678' },
  'Ghana': { format: '+233 XXX XXX XXX', example: '+233 244 123 456' },
  'Egypt': { format: '+20 XXX XXX XXXX', example: '+20 100 123 4567' },
  'Morocco': { format: '+212 XXX XXX XXX', example: '+212 612 345 678' },
  'Algeria': { format: '+213 XXX XXX XXX', example: '+213 551 234 567' },
  'Tunisia': { format: '+216 XX XXX XXX', example: '+216 20 123 456' },
  'Uganda': { format: '+256 XXX XXX XXX', example: '+256 712 345 678' },
  'Tanzania': { format: '+255 XXX XXX XXX', example: '+255 712 345 678' },
  'Ethiopia': { format: '+251 XX XXX XXXX', example: '+251 91 123 4567' },
  'Cameroon': { format: '+237 X XX XX XX XX', example: '+237 6 77 12 34 56' },
  'Ivory Coast': { format: '+225 XX XX XX XX XX', example: '+225 07 12 34 56 78' },
  'Senegal': { format: '+221 XX XXX XX XX', example: '+221 77 123 45 67' },
  'Zimbabwe': { format: '+263 XX XXX XXXX', example: '+263 71 234 5678' },
  'Zambia': { format: '+260 XX XXX XXXX', example: '+260 97 123 4567' },
  'Rwanda': { format: '+250 XXX XXX XXX', example: '+250 788 123 456' },
  'Mali': { format: '+223 XX XX XX XX', example: '+223 70 12 34 56' },
  'Malawi': { format: '+265 X XX XX XX XX', example: '+265 9 88 12 34 56' },
  'Mozambique': { format: '+258 XX XXX XXXX', example: '+258 82 123 4567' },
  'Namibia': { format: '+264 XX XXX XXXX', example: '+264 81 123 4567' },
  'Botswana': { format: '+267 XX XXX XXX', example: '+267 71 123 456' },
  'Libya': { format: '+218 XX XXX XXXX', example: '+218 91 234 5678' },
  'Madagascar': { format: '+261 XX XX XXX XX', example: '+261 32 12 345 67' },
  'Angola': { format: '+244 XXX XXX XXX', example: '+244 923 123 456' },
  'Sudan': { format: '+249 XX XXX XXXX', example: '+249 91 123 4567' },
  'Chad': { format: '+235 XX XX XX XX', example: '+235 66 12 34 56' },
  'Somalia': { format: '+252 XX XXX XXXX', example: '+252 61 123 4567' },
  'DR Congo': { format: '+243 XXX XXX XXX', example: '+243 812 345 678' },
  'Mauritius': { format: '+230 XXXX XXXX', example: '+230 5251 2345' },
  'Gabon': { format: '+241 X XX XX XX', example: '+241 6 12 34 56' },
  'Guinea': { format: '+224 XXX XX XX XX', example: '+224 622 12 34 56' },
  'Benin': { format: '+229 XX XX XX XX', example: '+229 97 12 34 56' },
  'Togo': { format: '+228 XX XX XX XX', example: '+228 90 12 34 56' },
  'Sierra Leone': { format: '+232 XX XXX XXX', example: '+232 76 123 456' },
  'Liberia': { format: '+231 XX XXX XXXX', example: '+231 77 012 3456' },
  'Mauritania': { format: '+222 XX XX XX XX', example: '+222 22 12 34 56' },
  'Lesotho': { format: '+266 X XXX XXXX', example: '+266 5 012 3456' },
  'Gambia': { format: '+220 XXX XXXX', example: '+220 301 2345' },
  'Niger': { format: '+227 XX XX XX XX', example: '+227 96 12 34 56' },
  'Burkina Faso': { format: '+226 XX XX XX XX', example: '+226 70 12 34 56' },
}

export function getPhoneInfo(countryName: string): PhoneInfo | undefined {
  return countryPhoneInfo[countryName]
}
