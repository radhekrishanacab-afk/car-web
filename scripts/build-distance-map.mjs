/**
 * Builds complete distance map from all Excel data and updates DB
 * All distances from km-perfreate-giveme-1-UPDATED.xlsx
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
const prisma = new PrismaClient()

// Complete verified distance table from Excel
// Key: 'OriginCity|DestCity', Value: km (integer, rounded)
const D = {}

// Helper to add both directions
function add(o, d, km) {
  const k = Math.round(Number(km))
  D[`${o}|${d}`] = k
}

// ── All data from Excel ────────────────────────────────────────────────────
// Abu
add('Abu','Ahmedabad',223);add('Abu','Ajmer',334);add('Abu','Alang',490);add('Abu','Ambaji',38);add('Abu','Amreli',486);add('Abu','Anand',292);add('Abu','Ankleshwar',423);add('Abu','Bagasara',503);add('Abu','Bagodara',309);add('Abu','Balasinor',231);add('Abu','Balotra',166);add('Abu','Bardoli',489);add('Abu','Barmer',237);add('Abu','Bawla',243);add('Abu','Beawar',288);add('Abu','Bharuch',413);add('Abu','Bhavnagar',445);add('Abu','Bhilwara',255);add('Abu','Bhuj',518);add('Abu','Bikaner',430);add('Abu','Borsad',313);add('Abu','Botad',368);add('Abu','Chandigarh',891);add('Abu','Chittorgarh',227);add('Abu','Dahej',471);add('Abu','Dahod',301);add('Abu','Dakor',266);add('Abu','Daman',581);add('Abu','Deesa',74);add('Abu','Delhi',718);add('Abu','Delvada',595);add('Abu','Dholka',260);add('Abu','Dhrangadhra',295);add('Abu','Dwarka',638);add('Abu','Gandhidham',460);add('Abu','Gandhinagar',198);add('Abu','Godhra',273);add('Abu','Gondal',463);add('Abu','Halol',294);add('Abu','Halvad',330);add('Abu','Himatnagar',133);add('Abu','Idar',101);add('Abu','Jaipur',476);add('Abu','Jaisalmer',363);add('Abu','Jamnagar',507);add('Abu','Jasdan',427);add('Abu','Jetpur',490);add('Abu','Jodhpur',209);add('Abu','Junagadh',527);add('Abu','Kadi',183);add('Abu','Kalol',192);add('Abu','Kandla',448);add('Abu','Kapadvanj',228);add('Abu','Karjan',365);add('Abu','Kathlal',280);add('Abu','Keshod',562);add('Abu','Khambhaliya',569);add('Abu','Khambhat',322);add('Abu','Kheda',262);add('Abu','Kodinar',597);add('Abu','Kota',375);add('Abu','Kutch',515);add('Abu','Limdi',316);add('Abu','Luni',185);add('Abu','Mahuva',522);add('Abu','Manavadar',538);add('Abu','Mandvi',560);add('Abu','Mehsana',144);add('Abu','Modasa',163);add('Abu','Morbi',371);add('Abu','Mumbai Airport',742);add('Abu','Mumbai Central',755);add('Abu','Mundra',515);add('Abu','Nadiad',279);add('Abu','Navsari',515);add('Abu','Nizar',473);add('Abu','Okha',623);add('Abu','Palanpur',65);add('Abu','Pali',167);add('Abu','Palitana',470);add('Abu','Patan',123);add('Abu','Porbandar',610);add('Abu','Pune',833);add('Abu','Radhanpur',161);add('Abu','Rajkot',417);add('Abu','Rajsamand',162);add('Abu','Ranip',214);add('Abu','Sachin',494);add('Abu','Sanand',224);add('Abu','Savarkundla',522);add('Abu','Sihor',440);add('Abu','Sirohi',43);add('Abu','Somnath',611);add('Abu','Songadh',523);add('Abu','Surat',484);add('Abu','Surendranagar',298);add('Abu','Talaja',488);add('Abu','Thane',726);add('Abu','Tharad',127);add('Abu','Udaipur',115);add('Abu','Una',588);add('Abu','Unjha',115);add('Abu','Upleta',533);add('Abu','Vadnagar',103);add('Abu','Vadodara',334);add('Abu','Vallabh Vidyanagar',294);add('Abu','Valsad',557);add('Abu','Vapi',582);add('Abu','Veraval',605);add('Abu','Viramgam',226);add('Abu','Visnagar',120);add('Abu','Vyara',524);add('Abu','Wadhwan',297);add('Abu','Wankaner',373);
// Ahmedabad
add('Ahmedabad','Abu',223);add('Ahmedabad','Ajmer',518);add('Ahmedabad','Alang',286);add('Ahmedabad','Ambaji',193);add('Ahmedabad','Amreli',281);add('Ahmedabad','Anand',78);add('Ahmedabad','Ankleshwar',208);add('Ahmedabad','Bagasara',299);add('Ahmedabad','Bagodara',97);add('Ahmedabad','Balasinor',120);add('Ahmedabad','Balotra',390);add('Ahmedabad','Bardoli',274);add('Ahmedabad','Barmer',383);add('Ahmedabad','Bawla',35);add('Ahmedabad','Beawar',458);add('Ahmedabad','Bharuch',198);add('Ahmedabad','Bhavnagar',241);add('Ahmedabad','Bhilwara',392);add('Ahmedabad','Bhuj',359);add('Ahmedabad','Bikaner',647);add('Ahmedabad','Borsad',98);add('Ahmedabad','Botad',164);add('Ahmedabad','Chandigarh',1083);add('Ahmedabad','Chittorgarh',362);add('Ahmedabad','Dahej',256);add('Ahmedabad','Dahod',227);add('Ahmedabad','Dakor',99);add('Ahmedabad','Daman',366);add('Ahmedabad','Deesa',174);add('Ahmedabad','Delhi',882);add('Ahmedabad','Delvada',391);add('Ahmedabad','Dholka',43);add('Ahmedabad','Dhrangadhra',135);add('Ahmedabad','Dwarka',479);add('Ahmedabad','Gandhidham',300);add('Ahmedabad','Gandhinagar',27);add('Ahmedabad','Godhra',156);add('Ahmedabad','Gondal',276);add('Ahmedabad','Halol',142);add('Ahmedabad','Halvad',171);add('Ahmedabad','Himatnagar',92);add('Ahmedabad','Idar',125);add('Ahmedabad','Jaipur',623);add('Ahmedabad','Jaisalmer',540);add('Ahmedabad','Jamnagar',348);add('Ahmedabad','Jasdan',223);add('Ahmedabad','Jetpur',301);add('Ahmedabad','Jodhpur',427);add('Ahmedabad','Junagadh',338);add('Ahmedabad','Kadi',49);add('Ahmedabad','Kalol',31);add('Ahmedabad','Kandla',289);add('Ahmedabad','Kapadvanj',86);add('Ahmedabad','Karjan',150);add('Ahmedabad','Kathlal',75);add('Ahmedabad','Keshod',373);add('Ahmedabad','Khambhaliya',410);add('Ahmedabad','Khambhat',98);add('Ahmedabad','Kheda',39);add('Ahmedabad','Kodinar',393);add('Ahmedabad','Kota',510);add('Ahmedabad','Kutch',355);add('Ahmedabad','Limdi',108);add('Ahmedabad','Luni',403);add('Ahmedabad','Mahuva',318);add('Ahmedabad','Manavadar',349);add('Ahmedabad','Mandvi',401);add('Ahmedabad','Mehsana',79);add('Ahmedabad','Modasa',110);add('Ahmedabad','Morbi',212);add('Ahmedabad','Mumbai Airport',527);add('Ahmedabad','Mumbai Central',541);add('Ahmedabad','Mundra',355);add('Ahmedabad','Nadiad',63);add('Ahmedabad','Navsari',300);add('Ahmedabad','Nizar',259);add('Ahmedabad','Okha',463);add('Ahmedabad','Palanpur',158);add('Ahmedabad','Pali',385);add('Ahmedabad','Palitana',266);add('Ahmedabad','Patan',125);add('Ahmedabad','Porbandar',421);add('Ahmedabad','Pune',618);add('Ahmedabad','Radhanpur',170);add('Ahmedabad','Rajkot',258);add('Ahmedabad','Rajsamand',318);add('Ahmedabad','Ranip',9);add('Ahmedabad','Sachin',279);add('Ahmedabad','Sanand',24);add('Ahmedabad','Savarkundla',318);add('Ahmedabad','Sihor',236);add('Ahmedabad','Sirohi',261);add('Ahmedabad','Somnath',422);add('Ahmedabad','Songadh',309);add('Ahmedabad','Surat',269);add('Ahmedabad','Surendranagar',138);add('Ahmedabad','Talaja',284);add('Ahmedabad','Thane',511);add('Ahmedabad','Tharad',215);add('Ahmedabad','Udaipur',250);add('Ahmedabad','Una',384);add('Ahmedabad','Unjha',108);add('Ahmedabad','Upleta',343);add('Ahmedabad','Vadnagar',121);add('Ahmedabad','Vadodara',124);add('Ahmedabad','Vallabh Vidyanagar',79);add('Ahmedabad','Valsad',342);add('Ahmedabad','Vapi',367);add('Ahmedabad','Veraval',416);add('Ahmedabad','Viramgam',67);add('Ahmedabad','Visnagar',105);add('Ahmedabad','Vyara',309);add('Ahmedabad','Wadhwan',132);add('Ahmedabad','Wankaner',214);
// Amreli
add('Amreli','Bagasara',33);add('Amreli','Bagodara',189);add('Amreli','Balasinor',366);add('Amreli','Balotra',652);add('Amreli','Bardoli',437);add('Amreli','Barmer',603);add('Amreli','Bawla',247);add('Amreli','Beawar',737);add('Amreli','Bharuch',362);add('Amreli','Bhavnagar',123);add('Amreli','Bhilwara',672);add('Amreli','Bhuj',314);add('Amreli','Bikaner',910);add('Amreli','Borsad',279);add('Amreli','Botad',118);add('Amreli','Chandigarh',1362);add('Amreli','Chittorgarh',641);add('Amreli','Dahej',419);add('Amreli','Dahod',461);add('Amreli','Dakor',331);add('Amreli','Daman',529);add('Amreli','Deesa',436);add('Amreli','Delhi',1161);add('Amreli','Delvada',115);add('Amreli','Dholka',244);add('Amreli','Dhrangadhra',215);add('Amreli','Dwarka',302);add('Amreli','Gandhidham',256);add('Amreli','Gandhinagar',306);add('Amreli','Godhra',388);add('Amreli','Gondal',72);add('Amreli','Halol',361);add('Amreli','Halvad',199);add('Amreli','Himatnagar',372);add('Amreli','Idar',404);add('Amreli','Jaipur',902);add('Amreli','Jaisalmer',760);add('Amreli','Jamnagar',207);add('Amreli','Jasdan',58);add('Amreli','Jetpur',73);add('Amreli','Jodhpur',689);add('Amreli','Junagadh',98);add('Amreli','Kadi',303);add('Amreli','Kalol',303);add('Amreli','Kandla',244);add('Amreli','Kapadvanj',334);add('Amreli','Karjan',313);add('Amreli','Kathlal',306);add('Amreli','Keshod',134);add('Amreli','Khambhaliya',264);add('Amreli','Khambhat',243);add('Amreli','Kheda',273);add('Amreli','Kodinar',130);add('Amreli','Kota',789);add('Amreli','Kutch',311);add('Amreli','Limdi',174);add('Amreli','Luni',665);add('Amreli','Mahuva',91);add('Amreli','Manavadar',106);add('Amreli','Mandvi',356);add('Amreli','Mehsana',342);add('Amreli','Modasa',390);add('Amreli','Morbi',167);add('Amreli','Mumbai Airport',690);add('Amreli','Mumbai Central',704);add('Amreli','Mundra',311);add('Amreli','Nadiad',296);add('Amreli','Navsari',463);add('Amreli','Nizar',422);add('Amreli','Okha',323);add('Amreli','Palanpur',420);add('Amreli','Pali',647);add('Amreli','Palitana',72);add('Amreli','Patan',387);add('Amreli','Porbandar',193);add('Amreli','Pune',781);add('Amreli','Radhanpur',363);add('Amreli','Rajkot',117);add('Amreli','Rajsamand',597);add('Amreli','Ranip',287);add('Amreli','Sachin',443);add('Amreli','Sanand',266);add('Amreli','Savarkundla',36);add('Amreli','Sihor',102);add('Amreli','Sirohi',523);add('Amreli','Somnath',170);add('Amreli','Songadh',472);add('Amreli','Surat',432);add('Amreli','Surendranagar',189);add('Amreli','Talaja',106);add('Amreli','Thane',675);add('Amreli','Tharad',435);add('Amreli','Udaipur',529);add('Amreli','Una',110);add('Amreli','Unjha',371);add('Amreli','Upleta',116);add('Amreli','Vadnagar',384);add('Amreli','Vadodara',317);add('Amreli','Vallabh Vidyanagar',292);add('Amreli','Valsad',506);add('Amreli','Vapi',530);add('Amreli','Veraval',176);add('Amreli','Viramgam',260);add('Amreli','Visnagar',367);add('Amreli','Vyara',472);add('Amreli','Wadhwan',188);add('Amreli','Wankaner',137);
// Surat
add('Surat','Ahmedabad',269);add('Surat','Vadodara',150);add('Surat','Mumbai Airport',258);add('Surat','Mumbai Central',273);add('Surat','Bharuch',71);add('Surat','Ankleshwar',65);add('Surat','Bardoli',35);add('Surat','Sachin',13);add('Surat','Navsari',33);add('Surat','Vapi',99);add('Surat','Valsad',73);add('Surat','Daman',98);add('Surat','Thane',242);add('Surat','Bhavnagar',391);add('Surat','Rajkot',435);add('Surat','Bhuj',582);add('Surat','Gandhinagar',296);add('Surat','Pune',349);add('Surat','Jamnagar',525);add('Surat','Junagadh',489);
// Vadodara
add('Vadodara','Ahmedabad',124);add('Vadodara','Surat',150);add('Vadodara','Anand',46);add('Vadodara','Bharuch',79);add('Vadodara','Halol',44);add('Vadodara','Godhra',78);add('Vadodara','Karjan',35);add('Vadodara','Borsad',38);add('Vadodara','Nadiad',65);add('Vadodara','Khambhat',74);add('Vadodara','Mumbai Airport',408);add('Vadodara','Mumbai Central',423);add('Vadodara','Delhi',990);add('Vadodara','Pune',499);add('Vadodara','Rajkot',320);
// Rajkot
add('Rajkot','Ahmedabad',258);add('Rajkot','Jamnagar',90);add('Rajkot','Gondal',46);add('Rajkot','Morbi',69);add('Rajkot','Wankaner',44);add('Rajkot','Jasdan',61);add('Rajkot','Jetpur',73);add('Rajkot','Junagadh',110);add('Rajkot','Bhavnagar',198);add('Rajkot','Amreli',117);add('Rajkot','Surendranagar',127);add('Rajkot','Gandhidham',157);add('Rajkot','Kandla',146);add('Rajkot','Keshod',145);add('Rajkot','Porbandar',193);add('Rajkot','Dwarka',221);add('Rajkot','Mumbai Airport',694);add('Rajkot','Mumbai Central',707);
// Bhuj/Kutch
add('Bhuj','Ahmedabad',359);add('Bhuj','Gandhidham',61);add('Bhuj','Kutch',22);add('Bhuj','Mundra',54);add('Bhuj','Kandla',70);add('Bhuj','Mandvi',67);add('Bhuj','Morbi',147);add('Bhuj','Dhrangadhra',223);add('Bhuj','Halvad',196);add('Bhuj','Rajkot',215);add('Bhuj','Jamnagar',305);add('Bhuj','Bhavnagar',393);
// Jamnagar
add('Jamnagar','Ahmedabad',348);add('Jamnagar','Rajkot',90);add('Jamnagar','Dwarka',131);add('Jamnagar','Morbi',158);add('Jamnagar','Khambhaliya',62);add('Jamnagar','Gondal',135);add('Jamnagar','Porbandar',133);add('Jamnagar','Okha',116);add('Jamnagar','Kandla',235);add('Jamnagar','Gandhidham',247);
// Bhavnagar
add('Bhavnagar','Ahmedabad',241);add('Bhavnagar','Alang',49);add('Bhavnagar','Sihor',24);add('Bhavnagar','Palitana',52);add('Bhavnagar','Talaja',57);add('Bhavnagar','Botad',77);add('Bhavnagar','Mahuva',106);add('Bhavnagar','Rajkot',198);add('Bhavnagar','Surendranagar',148);add('Bhavnagar','Gandhinagar',266);
// Junagadh/Somnath/Veraval area
add('Junagadh','Rajkot',110);add('Junagadh','Keshod',39);add('Junagadh','Jetpur',37);add('Junagadh','Gondal',72);add('Junagadh','Somnath',84);add('Junagadh','Manavadar',12);add('Junagadh','Veraval',78);add('Junagadh','Porbandar',99);add('Junagadh','Delvada',153);add('Junagadh','Amreli',98);add('Junagadh','Una',147);add('Junagadh','Bhavnagar',222);add('Junagadh','Dwarka',207);add('Junagadh','Ahmedabad',338);
add('Somnath','Veraval',6);add('Somnath','Kodinar',40);add('Somnath','Delvada',76);add('Somnath','Una',75);add('Somnath','Junagadh',84);add('Somnath','Keshod',58);add('Somnath','Ahmedabad',422);
add('Veraval','Somnath',6);add('Veraval','Keshod',53);add('Veraval','Kodinar',45);add('Veraval','Delvada',81);add('Veraval','Una',80);add('Veraval','Junagadh',78);add('Veraval','Ahmedabad',416);
add('Delvada','Una',7);add('Una','Delvada',7);add('Una','Kodinar',41);add('Una','Somnath',75);add('Una','Veraval',80);add('Una','Ahmedabad',384);add('Una','Amreli',110);
// Dwarka/Okha
add('Dwarka','Okha',33);add('Okha','Dwarka',33);add('Dwarka','Jamnagar',131);add('Dwarka','Khambhaliya',80);add('Dwarka','Porbandar',109);add('Dwarka','Ahmedabad',479);add('Dwarka','Rajkot',221);
// Gandhinagar/Mehsana area
add('Gandhinagar','Ahmedabad',27);add('Gandhinagar','Mehsana',66);add('Gandhinagar','Kalol',18);add('Gandhinagar','Kadi',39);add('Gandhinagar','Patan',112);add('Gandhinagar','Himatnagar',65);add('Gandhinagar','Modasa',83);add('Gandhinagar','Vadodara',151);add('Gandhinagar','Surat',296);
add('Mehsana','Ahmedabad',79);add('Mehsana','Gandhinagar',66);add('Mehsana','Patan',46);add('Mehsana','Unjha',29);add('Mehsana','Visnagar',26);add('Mehsana','Vadnagar',42);add('Mehsana','Kadi',39);add('Mehsana','Deesa',94);add('Mehsana','Palanpur',78);
// Palanpur/Deesa area
add('Palanpur','Deesa',32);add('Palanpur','Ambaji',54);add('Palanpur','Abu',65);add('Palanpur','Radhanpur',120);add('Palanpur','Patan',57);add('Palanpur','Mehsana',78);add('Palanpur','Ahmedabad',158);
// Surendranagar area
add('Surendranagar','Ahmedabad',138);add('Surendranagar','Wadhwan',6);add('Surendranagar','Dhrangadhra',41);add('Surendranagar','Morbi',113);add('Surendranagar','Limdi',31);add('Surendranagar','Botad',71);add('Surendranagar','Halvad',68);add('Surendranagar','Rajkot',127);
// Anand area
add('Anand','Vallabh Vidyanagar',2);add('Anand','Nadiad',19);add('Anand','Borsad',21);add('Anand','Khambhat',51);add('Anand','Kheda',39);add('Anand','Vadodara',46);add('Anand','Ahmedabad',78);add('Anand','Bharuch',121);add('Anand','Godhra',94);
// Nadiad/Kheda area
add('Nadiad','Kathlal',12);add('Nadiad','Anand',19);add('Nadiad','Kheda',24);add('Nadiad','Dakor',36);add('Nadiad','Vallabh Vidyanagar',20);add('Nadiad','Ahmedabad',63);add('Nadiad','Borsad',38);
add('Kathlal','Anand',12);add('Kathlal','Vallabh Vidyanagar',14);
add('Vallabh Vidyanagar','Anand',2);add('Vallabh Vidyanagar','Ahmedabad',79);
// Wadhwan/Morbi area
add('Wadhwan','Surendranagar',6);add('Wadhwan','Limdi',24);add('Morbi','Wankaner',30);add('Wankaner','Morbi',30);add('Wankaner','Rajkot',44);
// Mumbai area
add('Mumbai Airport','Mumbai Central',17);add('Mumbai Central','Mumbai Airport',17);add('Mumbai Airport','Thane',22);add('Thane','Mumbai Airport',22);add('Mumbai Airport','Pune',139);add('Mumbai Central','Pune',137);add('Mumbai Airport','Daman',166);add('Mumbai Airport','Vapi',165);add('Mumbai Airport','Valsad',185);add('Mumbai Airport','Navsari',231);add('Mumbai Airport','Surat',258);add('Mumbai Airport','Bharuch',329);add('Mumbai Airport','Vadodara',408);add('Mumbai Airport','Ahmedabad',527);
// Daman/Vapi area
add('Daman','Vapi',10);add('Vapi','Daman',10);add('Daman','Valsad',30);add('Valsad','Daman',30);add('Daman','Navsari',71);add('Navsari','Daman',71);add('Daman','Surat',98);add('Surat','Daman',98);
// Gandhidham/Kandla/Mundra
add('Gandhidham','Kandla',12);add('Kandla','Gandhidham',12);add('Gandhidham','Mundra',60);add('Mundra','Gandhidham',60);add('Gandhidham','Bhuj',61);add('Gandhidham','Kutch',55);add('Kutch','Bhuj',22);add('Kandla','Kutch',67);add('Kandla','Mundra',66);add('Mundra','Kandla',66);add('Mandvi','Bhuj',67);add('Mandvi','Kutch',84);add('Mandvi','Mundra',46);add('Mandvi','Gandhidham',105);
// Key city pairs from full Excel
add('Bharuch','Ankleshwar',11);add('Ankleshwar','Bharuch',11);add('Bharuch','Surat',71);add('Bharuch','Vadodara',79);add('Bharuch','Dahej',58);add('Bharuch','Karjan',49);add('Bharuch','Navsari',103);
add('Bardoli','Surat',35);add('Sachin','Surat',13);add('Navsari','Surat',33);add('Navsari','Sachin',21);add('Navsari','Bardoli',30);
add('Alang','Bhavnagar',49);add('Alang','Talaja',21);add('Palitana','Bhavnagar',52);add('Palitana','Talaja',35);add('Palitana','Sihor',31);add('Sihor','Bhavnagar',24);
add('Gondal','Jetpur',35);add('Gondal','Jasdan',52);add('Keshod','Jetpur',73);add('Jetpur','Gondal',35);add('Upleta','Jetpur',43);add('Jetpur','Upleta',43);
add('Modasa','Himatnagar',45);add('Himatnagar','Modasa',45);add('Himatnagar','Idar',32);add('Idar','Himatnagar',32);
add('Dakor','Balasinor',36);add('Dakor','Godhra',57);add('Dakor','Halol',52);
add('Delhi','Chandigarh',263);add('Jaipur','Delhi',259);add('Ajmer','Jaipur',143);add('Ajmer','Beawar',60);add('Beawar','Ajmer',60);
add('Luni','Jodhpur',32);add('Jodhpur','Luni',32);add('Jodhpur','Pali',72);add('Pali','Jodhpur',72);
add('Bikaner','Delhi',426);add('Chandigarh','Delhi',263);
add('Songadh','Vyara',23);add('Vyara','Songadh',23);add('Vyara','Navsari',59);add('Nizar','Songadh',50);add('Songadh','Nizar',50);
add('Valsad','Navsari',46);add('Navsari','Valsad',46);add('Vapi','Valsad',28);add('Valsad','Vapi',28);
add('Pune','Mumbai Airport',139);add('Pune','Mumbai Central',137);add('Pune','Thane',138);add('Thane','Pune',138);
add('Udaipur','Chittorgarh',112);add('Chittorgarh','Udaipur',112);add('Udaipur','Rajsamand',68);add('Rajsamand','Udaipur',68);add('Udaipur','Sirohi',105);add('Sirohi','Udaipur',105);add('Udaipur','Abu',115);
add('Kota','Chittorgarh',148);add('Kota','Jaipur',208);add('Kota','Delhi',441);add('Kota','Ajmer',203);
add('Dwarka','Porbandar',109);add('Porbandar','Dwarka',109);add('Porbandar','Junagadh',99);add('Porbandar','Rajkot',193);
add('Khambhaliya','Jamnagar',62);add('Khambhaliya','Dwarka',80);add('Khambhaliya','Okha',76);add('Okha','Khambhaliya',76);
add('Morbi','Dhrangadhra',77);add('Dhrangadhra','Morbi',77);add('Dhrangadhra','Halvad',35);add('Halvad','Dhrangadhra',35);
add('Wadhwan','Dhrangadhra',47);add('Dhrangadhra','Wadhwan',47);
add('Unjha','Patan',33);add('Patan','Unjha',33);add('Unjha','Visnagar',23);add('Visnagar','Unjha',23);add('Vadnagar','Visnagar',16);add('Visnagar','Vadnagar',16);
add('Deesa','Palanpur',32);add('Deesa','Tharad',70);add('Tharad','Deesa',70);add('Deesa','Ambaji',77);
add('Radhanpur','Deesa',87);add('Radhanpur','Patan',64);
add('Bagasara','Amreli',33);add('Amreli','Bagasara',33);
add('Jasdan','Amreli',58);add('Amreli','Jasdan',58);add('Jasdan','Gondal',52);add('Jasdan','Botad',60);add('Botad','Jasdan',60);
add('Balasinor','Dakor',36);add('Halol','Godhra',41);add('Godhra','Halol',41);add('Halol','Vadodara',44);
add('Kutch','Mundra',69);add('Mundra','Kutch',69);
add('Manavadar','Junagadh',12);add('Manavadar','Jetpur',48);add('Jetpur','Manavadar',48);
add('Keshod','Manavadar',28);add('Manavadar','Keshod',28);
add('Upleta','Junagadh',36);add('Junagadh','Upleta',36);
add('Upleta','Gondal',70);add('Gondal','Upleta',70);
add('Sihor','Palitana',31);add('Sihor','Talaja',49);add('Talaja','Sihor',49);
add('Dholka','Bawla',19);add('Bawla','Dholka',19);add('Sanand','Bawla',19);add('Bawla','Sanand',19);
add('Dholka','Ahmedabad',43);add('Viramgam','Bawla',53);add('Bawla','Viramgam',53);
add('Limdi','Wadhwan',24);add('Wadhwan','Limdi',24);
add('Surendranagar','Limdi',31);add('Limdi','Surendranagar',31);
add('Halvad','Morbi',50);add('Morbi','Halvad',50);
add('Halvad','Dhrangadhra',35);
add('Dhrangadhra','Gandhidham',165);add('Gandhidham','Dhrangadhra',165);
add('Kodinar','Delvada',41);add('Delvada','Kodinar',41);add('Delvada','Bagasara',91);add('Bagasara','Delvada',91);
add('Mahuva','Sihor',82);add('Sihor','Mahuva',82);add('Mahuva','Talaja',48);add('Talaja','Mahuva',48);
add('Alang','Mahuva',68);add('Mahuva','Alang',68);
add('Luni','Balotra',91);add('Balotra','Luni',91);
add('Bikaner','Jaisalmer',294);add('Jaisalmer','Bikaner',294);add('Barmer','Jaisalmer',158);add('Jaisalmer','Barmer',158);
add('Barmer','Balotra',98);add('Balotra','Barmer',98);add('Barmer','Luni',182);add('Luni','Barmer',182);
add('Pali','Ajmer',167);add('Ajmer','Pali',167);add('Pali','Balotra',124);add('Balotra','Pali',124);
add('Bhilwara','Chittorgarh',60);add('Chittorgarh','Bhilwara',60);add('Bhilwara','Ajmer',141);add('Ajmer','Bhilwara',141);
add('Rajsamand','Bhilwara',93);add('Bhilwara','Rajsamand',93);add('Rajsamand','Chittorgarh',89);add('Chittorgarh','Rajsamand',89);
add('Chandigarh','Bikaner',496);add('Bikaner','Chandigarh',496);
add('Ajmer','Bikaner',241);add('Bikaner','Ajmer',241);
add('Ajmer','Jodhpur',179);add('Jodhpur','Ajmer',179);add('Ajmer','Kota',203);add('Kota','Ajmer',203);
add('Beawar','Jodhpur',148);add('Jodhpur','Beawar',148);add('Beawar','Kota',202);add('Kota','Beawar',202);
add('Sirohi','Abu',43);add('Abu','Sirohi',43);add('Sirohi','Ambaji',70);add('Ambaji','Sirohi',70);
add('Ambaji','Abu',38);add('Abu','Ambaji',38);add('Ambaji','Palanpur',54);add('Palanpur','Ambaji',54);
add('Ambaji','Deesa',77);add('Deesa','Ambaji',77);
add('Himatnagar','Ahmedabad',92);add('Idar','Abu',101);add('Idar','Palanpur',103);add('Palanpur','Idar',103);
add('Godhra','Ahmedabad',156);add('Dahod','Godhra',76);add('Godhra','Dahod',76);
add('Dahod','Modasa',137);add('Modasa','Dahod',137);
add('Sachin','Navsari',21);add('Nizar','Navsari',123);add('Navsari','Nizar',123);
add('Songadh','Bardoli',56);add('Bardoli','Songadh',56);add('Songadh','Sachin',82);add('Sachin','Songadh',82);
add('Vyara','Bardoli',35);add('Bardoli','Vyara',35);add('Vyara','Surat',70);add('Surat','Vyara',70);
add('Kandla','Morbi',77);add('Morbi','Kandla',77);add('Kandla','Kutch',67);add('Kutch','Kandla',67);
add('Bhuj','Kutch',22);add('Kutch','Bhuj',22);
add('Gandhidham','Mundra',60);add('Gandhidham','Morbi',88);add('Morbi','Gandhidham',88);
add('Dakor','Kheda',60);add('Kheda','Dakor',60);add('Kheda','Dholka',30);add('Dholka','Kheda',30);
add('Kheda','Bawla',42);add('Bawla','Kheda',42);
add('Ranip','Ahmedabad',9);add('Ranip','Gandhinagar',19);add('Gandhinagar','Ranip',19);add('Ranip','Bawla',40);add('Bawla','Ranip',40);
add('Viramgam','Ahmedabad',67);add('Viramgam','Sanand',45);add('Sanand','Viramgam',45);
add('Sanand','Dholka',36);add('Dholka','Sanand',36);
add('Kapadvanj','Balasinor',34);add('Balasinor','Kapadvanj',34);add('Balasinor','Godhra',42);add('Godhra','Balasinor',42);
add('Borsad','Khambhat',37);add('Khambhat','Borsad',37);add('Borsad','Nadiad',38);add('Nadiad','Borsad',38);
add('Khambhat','Kheda',60);add('Kheda','Khambhat',60);
add('Karjan','Bharuch',49);add('Karjan','Vadodara',35);add('Vadodara','Karjan',35);
add('Karjan','Dabhoi',0);
add('Halol','Vadodara',44);add('Halol','Godhra',41);
add('Modasa','Kadi',122);add('Kadi','Modasa',122);add('Kadi','Mehsana',39);add('Mehsana','Kadi',39);
add('Kalol','Gandhinagar',18);add('Gandhinagar','Kalol',18);add('Kalol','Kadi',21);add('Kadi','Kalol',21);
add('Unjha','Mehsana',29);add('Visnagar','Mehsana',26);add('Patan','Mehsana',46);add('Mehsana','Patan',46);
add('Patan','Palanpur',57);add('Palanpur','Patan',57);add('Patan','Radhanpur',64);add('Radhanpur','Patan',64);
add('Deesa','Radhanpur',87);add('Radhanpur','Deesa',87);
add('Tharad','Radhanpur',72);add('Radhanpur','Tharad',72);add('Tharad','Palanpur',97);add('Palanpur','Tharad',97);
add('Tharad','Deesa',70);
add('Bhuj','Morbi',147);add('Morbi','Bhuj',147);
add('Jamnagar','Kandla',235);add('Kandla','Jamnagar',235);
add('Morbi','Surendranagar',113);add('Morbi','Dhrangadhra',77);
add('Gondal','Amreli',72);add('Amreli','Gondal',72);add('Gondal','Keshod',107);add('Keshod','Gondal',107);
add('Gondal','Jetpur',35);add('Gondal','Jasdan',52);add('Gondal','Morbi',114);add('Morbi','Gondal',114);
add('Jasdan','Jetpur',77);add('Jetpur','Jasdan',77);
add('Jetpur','Rajkot',73);add('Rajkot','Jetpur',73);add('Upleta','Rajkot',115);add('Rajkot','Upleta',115);
add('Keshod','Jetpur',73);add('Jetpur','Keshod',73);add('Keshod','Veraval',53);add('Veraval','Keshod',53);
add('Keshod','Somnath',58);add('Somnath','Keshod',58);
add('Kodinar','Somnath',40);add('Somnath','Kodinar',40);add('Kodinar','Delvada',41);
add('Delvada','Delvada',0);add('Una','Una',0);
add('Bhavnagar','Botad',77);add('Botad','Bhavnagar',77);add('Botad','Surendranagar',71);add('Surendranagar','Botad',71);
add('Botad','Limdi',56);add('Limdi','Botad',56);
add('Limdi','Bagodara',52);add('Bagodara','Limdi',52);
add('Bagodara','Bawla',65);add('Bawla','Bagodara',65);
add('Bagodara','Dholka',55);add('Dholka','Bagodara',55);
add('Kheda','Anand',39);add('Anand','Kheda',39);
add('Ankleshwar','Bharuch',11);add('Bharuch','Ankleshwar',11);add('Ankleshwar','Dahej',61);add('Dahej','Ankleshwar',61);
add('Dahej','Bharuch',58);add('Bharuch','Dahej',58);
add('Karjan','Karjan',0);
add('Sihor','Bhavnagar',24);add('Bhavnagar','Sihor',24);
add('Halvad','Wadhwan',71);add('Wadhwan','Halvad',71);add('Halvad','Surendranagar',68);add('Surendranagar','Halvad',68);
add('Halvad','Kandla',127);add('Kandla','Halvad',127);
add('Halvad','Bhuj',196);add('Bhuj','Halvad',196);
add('Halvad','Morbi',50);add('Morbi','Halvad',50);
add('Halvad','Dhrangadhra',35);add('Dhrangadhra','Halvad',35);
add('Kandla','Gandhidham',12);
add('Gandhidham','Kandla',12);
add('Mundra','Bhuj',54);add('Bhuj','Mundra',54);
add('Mandvi','Kutch',84);add('Kutch','Mandvi',84);add('Mandvi','Bhuj',67);add('Bhuj','Mandvi',67);
add('Mundra','Mandvi',46);add('Mandvi','Mundra',46);
add('Kutch','Gandhidham',55);
add('Delhi','Jaipur',259);add('Jaipur','Delhi',259);add('Delhi','Agra',0);
add('Chandigarh','Delhi',263);add('Delhi','Chandigarh',263);
add('Delhi','Jodhpur',563);add('Jodhpur','Delhi',563);
add('Ajmer','Delhi',384);add('Delhi','Ajmer',384);
add('Kota','Delhi',441);add('Delhi','Kota',441);
add('Udaipur','Delhi',632);add('Delhi','Udaipur',632);
add('Jaisalmer','Delhi',720);add('Delhi','Jaisalmer',720);
add('Bikaner','Delhi',426);add('Delhi','Bikaner',426);
add('Pune','Delhi',1489);add('Delhi','Pune',1489);
add('Chandigarh','Jaipur',479);add('Jaipur','Chandigarh',479);
add('Luni','Jodhpur',32);add('Jodhpur','Luni',32);
add('Jodhpur','Pali',72);add('Pali','Jodhpur',72);
add('Jaipur','Ajmer',143);add('Jaipur','Kota',208);add('Kota','Jaipur',208);
add('Bhilwara','Ajmer',141);add('Rajsamand','Ajmer',200);add('Ajmer','Rajsamand',200);
add('Chittorgarh','Kota',148);add('Kota','Chittorgarh',148);
add('Udaipur','Chittorgarh',112);
add('Udaipur','Abu',115);add('Udaipur','Sirohi',105);
add('Sirohi','Jodhpur',166);add('Jodhpur','Sirohi',166);
add('Sirohi','Balotra',139);add('Balotra','Sirohi',139);
add('Sirohi','Pali',124);add('Pali','Sirohi',124);
add('Sirohi','Beawar',245);add('Beawar','Sirohi',245);
add('Luni','Ajmer',186);add('Ajmer','Luni',186);add('Luni','Bikaner',249);add('Bikaner','Luni',249);
add('Bikaner','Jodhpur',220);add('Jodhpur','Bikaner',220);
add('Bikaner','Jaipur',383);add('Jaipur','Bikaner',383);
add('Bhilwara','Kota',142);add('Kota','Bhilwara',142);
add('Chittorgarh','Bhilwara',60);
add('Chittorgarh','Rajsamand',89);add('Rajsamand','Chittorgarh',89);
add('Rajsamand','Bhilwara',93);
add('Rajsamand','Jaipur',323);add('Jaipur','Rajsamand',323);
add('Rajsamand','Udaipur',68);add('Udaipur','Rajsamand',68);
add('Rajsamand','Jodhpur',171);add('Jodhpur','Rajsamand',171);
add('Jaipur','Jodhpur',322);add('Jodhpur','Jaipur',322);
add('Jaipur','Pali',309);add('Pali','Jaipur',309);
add('Jaisalmer','Jodhpur',246);add('Jodhpur','Jaisalmer',246);
add('Jaisalmer','Jaipur',567);add('Jaipur','Jaisalmer',567);
add('Barmer','Jodhpur',189);add('Jodhpur','Barmer',189);
add('Balotra','Jodhpur',103);add('Jodhpur','Balotra',103);
add('Balotra','Jaisalmer',197);add('Jaisalmer','Balotra',197);

console.log(`Distance map built: ${Object.keys(D).length} entries`)

function calcFare(km, perKm, minFare, minKm = 100) {
  const billable = Math.max(km, minKm)
  return Math.ceil(Math.max(billable * perKm, minFare) / 100) * 100
}

async function main() {
  console.log('Loading routes and vehicles...')
  const vehicles = await prisma.vehicle.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } })
  const routes = await prisma.route.findMany({
    include: {
      originCity: { select: { name: true, slug: true } },
      destinationCity: { select: { name: true, slug: true } },
    }
  })

  console.log(`Total routes: ${routes.length}, Vehicles: ${vehicles.length}`)
  console.log('Vehicles:', vehicles.map(v => `${v.name} ₹${Number(v.perKmRate)}/km`).join(', '))

  let distanceUpdated = 0
  let priceUpdated = 0
  const BATCH = 50

  for (let i = 0; i < routes.length; i += BATCH) {
    const batch = routes.slice(i, i + BATCH)

    for (const route of batch) {
      const o = route.originCity.name
      const d = route.destinationCity.name
      const key1 = `${o}|${d}`
      const key2 = `${d}|${o}`
      const verifiedKm = D[key1] || D[key2]

      if (verifiedKm && verifiedKm > 0) {
        const km = Math.max(verifiedKm, 1)
        const hrs = Math.round((km / 50) * 10) / 10

        await prisma.route.update({
          where: { id: route.id },
          data: { distanceKm: km, estimatedHours: hrs }
        })

        for (const v of vehicles) {
          const ow = calcFare(km, Number(v.perKmRate), Number(v.minimumFare), v.minimumBillableKm ? Number(v.minimumBillableKm) : 100)
          const rt = Math.ceil(ow * Number(v.roundTripRateMultiplier) / 100) * 100
          await prisma.routePrice.upsert({
            where: { routeId_vehicleId: { routeId: route.id, vehicleId: v.id } },
            update: { oneWayFare: ow, roundTrip: rt, isActive: true },
            create: { routeId: route.id, vehicleId: v.id, oneWayFare: ow, roundTrip: rt, isActive: true }
          })
          priceUpdated++
        }
        distanceUpdated++
      }
    }

    if (i % 500 === 0) process.stdout.write(`\r  ${i}/${routes.length} routes processed`)
  }

  console.log(`\n\n✅ Complete!`)
  console.log(`   Routes with verified km updated: ${distanceUpdated}/${routes.length}`)
  console.log(`   Price entries updated: ${priceUpdated}`)

  // Show sample
  const samples = await prisma.route.findMany({
    where: { originCity: { name: 'Ahmedabad' } },
    include: { originCity: true, destinationCity: true, priceOverrides: { include: { vehicle: true }, where: { isActive: true } } },
    take: 5
  })
  console.log('\nSample routes from Ahmedabad:')
  for (const r of samples) {
    const prices = r.priceOverrides.map(p => `${p.vehicle.name}: ₹${Number(p.oneWayFare)}`).join(', ')
    console.log(`  → ${r.destinationCity.name}: ${r.distanceKm}km | ${prices}`)
  }
}

main()
  .catch(e => { console.error('\nError:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
