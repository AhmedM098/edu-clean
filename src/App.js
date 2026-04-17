import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
} from "firebase/auth";
import { getDatabase, ref, set, onValue, get, push, remove } from "firebase/database";

// ── Firebase ───────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB5gnVFLN_qB4PIZNNFh4yMl2mJetjxYMk",
  authDomain: "edu-platform-a71e6.firebaseapp.com",
  databaseURL: "https://edu-platform-a71e6-default-rtdb.firebaseio.com",
  projectId: "edu-platform-a71e6",
  storageBucket: "edu-platform-a71e6.firebasestorage.app",
  messagingSenderId: "361988464092",
  appId: "1:361988464092:web:82cfc55f47b280c5e98319",
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db   = getDatabase(firebaseApp);

// ── Static Curriculum Data ─────────────────────────────────────────────────────
const CURRICULUM = {
  arabic: {
    label:"اللغة العربية", emoji:"📖", color:"#e53935", bg:"#fff0f0", xp:20,
    units:[
      { id:"u1", title:"القراءة", lessons:[
        { id:"l1", title:"الجملة الاسمية", content:"الجملة الاسمية هي الجملة التي تبدأ باسم، وتتكون من:\n• المبتدأ: وهو الاسم في أول الجملة\n• الخبر: وهو ما يُخبر عن المبتدأ\n\nمثال: البيتُ كبيرٌ\n• البيت = مبتدأ\n• كبير = خبر", video:"https://www.youtube.com/embed/dQw4w9WgXcQ", questions:[
          {q:"الجملة الاسمية تبدأ بـ؟", options:["فعل","اسم","حرف"], answer:"اسم"},
          {q:"ما المبتدأ في 'الولدُ مجتهدٌ'؟", options:["مجتهد","الولد","في"], answer:"الولد"},
          {q:"ما الخبر في 'الكتابُ مفيدٌ'؟", options:["الكتاب","مفيد","هو"], answer:"مفيد"},
        ]},
        { id:"l2", title:"الجملة الفعلية", content:"الجملة الفعلية هي التي تبدأ بفعل، وتتكون من:\n• الفعل\n• الفاعل\n• المفعول به (أحياناً)\n\nمثال: ذهبَ الطالبُ إلى المدرسة", video:"", questions:[
          {q:"الجملة الفعلية تبدأ بـ؟", options:["اسم","فعل","حرف"], answer:"فعل"},
          {q:"ما الفاعل في 'لعبَ أحمدُ'؟", options:["لعب","أحمد","في"], answer:"أحمد"},
        ]},
        { id:"l3", title:"المفرد والجمع", content:"المفرد: كلمة تدل على شيء واحد\nالجمع: كلمة تدل على أكثر من اثنين\n\nأمثلة:\n• كتاب ← كُتُب\n• قلم ← أقلام\n• طالب ← طلاب", video:"", questions:[
          {q:"جمع 'كتاب'؟", options:["كتابان","كتابات","كُتُب"], answer:"كُتُب"},
          {q:"جمع 'قلم'؟", options:["أقلام","أقلاب","قلمان"], answer:"أقلام"},
          {q:"مفرد 'طلاب'؟", options:["طالبان","طالب","طلبة"], answer:"طالب"},
        ]},
      ]},
      { id:"u2", title:"النحو", lessons:[
        { id:"l4", title:"الاسم وأنواعه", content:"الاسم هو كلمة تدل على إنسان أو حيوان أو نبات أو مكان أو شيء.\n\nأنواع الاسم:\n• الاسم العلم: اسم خاص مثل أحمد، مصر\n• الاسم النكرة: اسم غير محدد مثل رجل، كتاب\n• الاسم المعرفة: اسم محدد بـ 'ال' مثل الرجل، الكتاب", video:"", questions:[
          {q:"أيها اسم علم؟", options:["مدينة","القاهرة","بيت"], answer:"القاهرة"},
          {q:"أيها اسم نكرة؟", options:["الولد","محمد","طفل"], answer:"طفل"},
        ]},
        { id:"l5", title:"الفعل وأزمانه", content:"الفعل هو كلمة تدل على حدث في زمن معين.\n\nأزمنة الفعل:\n• الماضي: حدث وانتهى → كتبَ\n• المضارع: يحدث الآن → يكتبُ\n• الأمر: طلب الفعل → اكتُب", video:"", questions:[
          {q:"'ذهبَ' فعل؟", options:["ماضي","مضارع","أمر"], answer:"ماضي"},
          {q:"'يلعبُ' فعل؟", options:["ماضي","مضارع","أمر"], answer:"مضارع"},
          {q:"'اقرأْ' فعل؟", options:["ماضي","مضارع","أمر"], answer:"أمر"},
        ]},
        { id:"l6", title:"الحرف وأنواعه", content:"الحرف هو كلمة لا يظهر معناها إلا مع غيرها.\n\nأنواع الحروف:\n• حروف الجر: في، على، من، إلى، عن، الباء\n• حروف العطف: و، ف، ثم، أو\n• حروف النفي: لا، لم، لن", video:"", questions:[
          {q:"أيها حرف جر؟", options:["و","في","ثم"], answer:"في"},
          {q:"أيها حرف عطف؟", options:["على","لا","و"], answer:"و"},
        ]},
      ]},
      { id:"u3", title:"التعبير", lessons:[
        { id:"l7", title:"التعبير الشفهي", content:"التعبير الشفهي هو التحدث عن موضوع بطريقة واضحة ومنظمة.\n\nنقاط مهمة:\n• ابدأ بمقدمة\n• اشرح الفكرة بأمثلة\n• اختتم بخلاصة\n• تكلم بوضوح وثقة", video:"", questions:[
          {q:"التعبير الشفهي يعني؟", options:["الكتابة","التحدث","القراءة"], answer:"التحدث"},
        ]},
        { id:"l8", title:"كتابة الفقرة", content:"الفقرة الجيدة تحتوي على:\n• جملة رئيسية تعبر عن الفكرة\n• جمل داعمة تشرح وتوضح\n• جملة ختامية تلخص الفكرة\n\nمثال:\nالقراءة مفيدة جداً. [جملة رئيسية]\nتزيد المعرفة وتوسع الخيال. [جملة داعمة]\nلذلك يجب أن نقرأ كل يوم. [جملة ختامية]", video:"", questions:[
          {q:"أول جملة في الفقرة تسمى؟", options:["الجملة الختامية","الجملة الرئيسية","الجملة الداعمة"], answer:"الجملة الرئيسية"},
          {q:"عدد أجزاء الفقرة الجيدة؟", options:["جزءان","ثلاثة أجزاء","أربعة أجزاء"], answer:"ثلاثة أجزاء"},
        ]},
      ]},
    ],
  },
  social: {
    label:"الدراسات الاجتماعية", emoji:"🌍", color:"#2196f3", bg:"#e3f2fd", xp:20,
    units:[
      { id:"u1", title:"التاريخ", lessons:[
        { id:"l1", title:"الحضارة المصرية القديمة", content:"مصر القديمة من أعرق الحضارات في التاريخ.\n\nأهم ما تميزت به:\n• بناء الأهرامات\n• الكتابة الهيروغليفية\n• نظام الري والزراعة على ضفاف النيل\n• الفن والعمارة الرائعة\n\nالأهرامات بُنيت قبل أكثر من 4500 سنة!", video:"https://www.youtube.com/embed/Z8bsq8pOBHQ", questions:[
          {q:"من بنى الأهرامات؟", options:["الرومان","المصريون القدماء","الإغريق"], answer:"المصريون القدماء"},
          {q:"الكتابة القديمة في مصر تسمى؟", options:["اللاتينية","الهيروغليفية","العربية"], answer:"الهيروغليفية"},
          {q:"النيل مهم لمصر بسبب؟", options:["الزراعة","التعدين","الصناعة"], answer:"الزراعة"},
        ]},
        { id:"l2", title:"الدولة الإسلامية", content:"الإسلام بدأ في مكة المكرمة عام 610 ميلادي.\n\nأهم الأحداث:\n• ولادة الإسلام في مكة المكرمة\n• الهجرة إلى المدينة المنورة عام 622م\n• فتح مكة عام 630م\n• انتشار الإسلام في أنحاء العالم", video:"", questions:[
          {q:"الهجرة النبوية كانت إلى؟", options:["مكة","المدينة المنورة","الطائف"], answer:"المدينة المنورة"},
          {q:"فتح مكة كان عام؟", options:["610م","622م","630م"], answer:"630م"},
        ]},
        { id:"l3", title:"مصر الحديثة", content:"مصر الحديثة مرت بمراحل مهمة:\n\n• الحملة الفرنسية 1798م\n• محمد علي ومؤسس مصر الحديثة\n• حفر قناة السويس 1869م\n• ثورة 1952م وإعلان الجمهورية", video:"", questions:[
          {q:"من هو مؤسس مصر الحديثة؟", options:["عمر مكرم","محمد علي","الخديوي إسماعيل"], answer:"محمد علي"},
          {q:"قناة السويس حُفرت عام؟", options:["1800م","1869م","1952م"], answer:"1869م"},
        ]},
      ]},
      { id:"u2", title:"الجغرافيا", lessons:[
        { id:"l4", title:"خريطة مصر", content:"مصر تقع في شمال أفريقيا.\n\nأهم المعالم الجغرافية:\n• مساحتها: 1 مليون كم²\n• حدودها: ليبيا غرباً، السودان جنوباً، فلسطين شرقاً، البحر المتوسط شمالاً\n• نهر النيل يشق مصر من الجنوب للشمال\n• صحراء غربية وشرقية وسيناء", video:"", questions:[
          {q:"مصر تقع في؟", options:["آسيا","أفريقيا","أوروبا"], answer:"أفريقيا"},
          {q:"ماذا يوجد جنوب مصر؟", options:["ليبيا","إسرائيل","السودان"], answer:"السودان"},
          {q:"نهر النيل يتجه من؟", options:["الشمال للجنوب","الجنوب للشمال","الشرق للغرب"], answer:"الجنوب للشمال"},
        ]},
        { id:"l5", title:"المناخ والبيئة", content:"مصر لها مناخ متنوع:\n\n• الساحل الشمالي: معتدل، شتاء ممطر\n• الوادي والدلتا: حار صيفاً، معتدل شتاءً\n• الصحراء: حار جداً نهاراً، بارد ليلاً\n• جنوب سيناء: معتدل", video:"", questions:[
          {q:"المنطقة الأكثر مطراً في مصر؟", options:["الصعيد","الساحل الشمالي","الصحراء الغربية"], answer:"الساحل الشمالي"},
        ]},
        { id:"l6", title:"السكان والمدن", content:"مصر لها أكبر عدد سكان في العالم العربي.\n\nأكبر المدن:\n• القاهرة: العاصمة وأكبر مدينة\n• الإسكندرية: عروس البحر المتوسط\n• الجيزة\n• الأقصر وأسوان في الجنوب\n\nعدد السكان: أكثر من 100 مليون نسمة", video:"", questions:[
          {q:"عاصمة مصر؟", options:["الإسكندرية","الجيزة","القاهرة"], answer:"القاهرة"},
          {q:"تُعرف الإسكندرية بـ؟", options:["مدينة النيل","عروس البحر المتوسط","الفسطاط"], answer:"عروس البحر المتوسط"},
        ]},
      ]},
      { id:"u3", title:"الاقتصاد", lessons:[
        { id:"l7", title:"الموارد الاقتصادية", content:"الموارد الاقتصادية لمصر:\n\n• الزراعة: القطن، القمح، الذرة\n• السياحة: الأهرامات، المتاحف، الغردقة\n• قناة السويس: مصدر دخل ضخم\n• البترول والغاز الطبيعي\n• الصناعة والتصدير", video:"", questions:[
          {q:"أهم محصول زراعي مصري؟", options:["البن","القطن","الشاي"], answer:"القطن"},
          {q:"السياحة في مصر تشمل؟", options:["الأهرامات فقط","الأهرامات والمتاحف والشواطئ","الشواطئ فقط"], answer:"الأهرامات والمتاحف والشواطئ"},
        ]},
        { id:"l8", title:"التجارة والصادرات", content:"مصر تتجارة مع دول كثيرة.\n\nأهم الصادرات:\n• القطن والمنسوجات\n• البترول ومشتقاته\n• الأجهزة الكهربائية\n• المواد الغذائية\n\nأهم الواردات:\n• القمح والحبوب\n• الآلات والمعدات", video:"", questions:[
          {q:"مصر تصدر؟", options:["القمح","القطن","الأرز فقط"], answer:"القطن"},
        ]},
      ]},
    ],
  },
  science: {
    label:"العلوم", emoji:"🔬", color:"#4caf50", bg:"#e8f5e9", xp:25,
    units:[
      { id:"u1", title:"الكائنات الحية", lessons:[
        { id:"l1", title:"ما هو الكائن الحي؟", content:"الكائن الحي هو أي شيء يمتلك الصفات التالية:\n\n✅ يتنفس\n✅ ينمو ويتطور\n✅ يتكاثر وينجب\n✅ يتغذى\n✅ يتحرك (حتى لو بشكل بطيء كالنبات)\n✅ يحس بالبيئة ويستجيب لها\n\nأمثلة على الكائنات الحية:\n• الإنسان 👨\n• النبات 🌱\n• الحيوانات 🐘\n• الطيور 🐦\n• الحشرات 🐛", video:"https://www.youtube.com/embed/1o8zXl6K0hA", questions:[
          {q:"الكائن الحي هو؟", options:["الحجر","الإنسان والنبات والحيوان","الماء"], answer:"الإنسان والنبات والحيوان"},
          {q:"النبات كائن حي لأنه؟", options:["ثابت","ينمو ويتكاثر","صلب"], answer:"ينمو ويتكاثر"},
          {q:"الحجر ليس كائناً حياً لأنه؟", options:["لا لون له","لا ينمو ولا يتنفس","كبير الحجم"], answer:"لا ينمو ولا يتنفس"},
        ]},
        { id:"l2", title:"الخلية وحدة الحياة", content:"الخلية هي أصغر وحدة في الكائن الحي.\n\nأنواع الخلايا:\n• الخلية النباتية: لها جدار خلوي وبلاستيدات خضراء\n• الخلية الحيوانية: ليس لها جدار خلوي\n\nأجزاء الخلية:\n• النواة: مركز التحكم\n• السيتوبلازم: السائل الداخلي\n• الغشاء الخلوي: يحيط بالخلية", video:"", questions:[
          {q:"أصغر وحدة في الكائن الحي؟", options:["العضو","الخلية","النسيج"], answer:"الخلية"},
          {q:"مركز التحكم في الخلية؟", options:["الغشاء","النواة","السيتوبلازم"], answer:"النواة"},
          {q:"ما الذي يميز الخلية النباتية؟", options:["النواة","الجدار الخلوي","الغشاء"], answer:"الجدار الخلوي"},
        ]},
        { id:"l3", title:"التغذية عند النبات", content:"النبات يصنع غذاءه بنفسه!\n\nعملية البناء الضوئي:\n• النبات يمتص الماء من التربة عبر الجذور\n• يمتص ثاني أكسيد الكربون من الهواء\n• يستخدم ضوء الشمس\n• ينتج السكر والأكسجين\n\nمعادلة بسيطة:\nضوء + ماء + ثاني أكسيد الكربون ← سكر + أكسجين 🌞", video:"", questions:[
          {q:"النبات يصنع غذاءه بعملية؟", options:["التنفس","البناء الضوئي","الهضم"], answer:"البناء الضوئي"},
          {q:"النبات يمتص الماء عن طريق؟", options:["الأوراق","الجذور","الساق"], answer:"الجذور"},
          {q:"ما ينتجه النبات أثناء البناء الضوئي؟", options:["ثاني أكسيد الكربون","أكسجين وسكر","نيتروجين"], answer:"أكسجين وسكر"},
        ]},
        { id:"l4", title:"سلسلة الغذاء", content:"سلسلة الغذاء توضح من يأكل من في الطبيعة.\n\nمراحل السلسلة الغذائية:\n1️⃣ المنتج: النبات (يصنع غذاءه)\n2️⃣ المستهلك الأول: الحيوانات العاشبة (تأكل النبات)\n3️⃣ المستهلك الثاني: الحيوانات آكلة اللحوم (تأكل العاشبات)\n4️⃣ المحلل: البكتيريا والفطريات (تحلل الكائنات الميتة)\n\nمثال: عشب ← أرنب ← ثعلب ← نسر", video:"", questions:[
          {q:"من يبدأ سلسلة الغذاء؟", options:["الأسد","النبات","الأرنب"], answer:"النبات"},
          {q:"الأرنب في سلسلة الغذاء هو؟", options:["منتج","مستهلك أول","مستهلك ثاني"], answer:"مستهلك أول"},
        ]},
      ]},
      { id:"u2", title:"المادة والطاقة", lessons:[
        { id:"l5", title:"حالات المادة", content:"المادة لها ثلاث حالات رئيسية:\n\n🧊 الصلبة: شكل وحجم ثابتان\nمثال: الحجر، الجليد، الحديد\n\n💧 السائلة: حجم ثابت وشكل يتغير\nمثال: الماء، الحليب، الزيت\n\n💨 الغازية: شكل وحجم يتغيران\nمثال: الهواء، البخار، الأكسجين\n\nيمكن تحويل المادة من حالة لأخرى بالتسخين أو التبريد.", video:"", questions:[
          {q:"الجليد في أي حالة؟", options:["سائل","صلب","غاز"], answer:"صلب"},
          {q:"ماذا يحدث للماء عند التسخين؟", options:["يصبح صلب","يصبح بخار","يختفي"], answer:"يصبح بخار"},
          {q:"الهواء في أي حالة؟", options:["صلب","سائل","غاز"], answer:"غاز"},
        ]},
        { id:"l6", title:"مصادر الطاقة", content:"الطاقة هي القدرة على القيام بعمل.\n\nمصادر الطاقة:\n☀️ الطاقة الشمسية: من الشمس، نظيفة ومتجددة\n💨 طاقة الرياح: من حركة الهواء\n💧 الطاقة المائية: من تدفق المياه\n🛢️ الوقود الأحفوري: بترول وغاز وفحم (غير متجددة)\n⚛️ الطاقة النووية: من الذرات\n\nالطاقة المتجددة: لا تنفد وصديقة للبيئة", video:"", questions:[
          {q:"الطاقة الشمسية مصدرها؟", options:["القمر","الشمس","النجوم"], answer:"الشمس"},
          {q:"أي مصادر الطاقة غير متجددة؟", options:["الطاقة الشمسية","البترول والغاز","طاقة الرياح"], answer:"البترول والغاز"},
          {q:"الطاقة المائية تأتي من؟", options:["الأمطار فقط","تدفق المياه","البحار فقط"], answer:"تدفق المياه"},
        ]},
        { id:"l7", title:"الضوء والصوت", content:"الضوء:\n• ينتقل بخطوط مستقيمة\n• أسرع من الصوت بكثير\n• يمكن انعكاسه وانكساره\n• يتكون من ألوان قوس قزح\n\nالصوت:\n• ينتقل عبر الهواء والماء والمواد الصلبة\n• ينتج من الاهتزازات\n• يحتاج وسطاً مادياً للانتقال\n• لا يسير في الفراغ", video:"", questions:[
          {q:"الضوء ينتقل بـ؟", options:["خطوط منحنية","خطوط مستقيمة","دوائر"], answer:"خطوط مستقيمة"},
          {q:"الصوت ينتج من؟", options:["الضوء","الاهتزازات","الحرارة"], answer:"الاهتزازات"},
        ]},
      ]},
      { id:"u3", title:"الفضاء والبيئة", lessons:[
        { id:"l8", title:"المجموعة الشمسية", content:"المجموعة الشمسية تتكون من:\n\n☀️ الشمس: نجم في المركز\n🪐 8 كواكب تدور حولها:\n1. عطارد (الأقرب)\n2. الزهرة\n3. الأرض 🌍\n4. المريخ\n5. المشتري (الأكبر)\n6. زحل (له حلقات)\n7. أورانوس\n8. نبتون (الأبعد)\n\nالقمر يدور حول الأرض", video:"", questions:[
          {q:"الشمس هي؟", options:["كوكب","نجم","قمر"], answer:"نجم"},
          {q:"أكبر كوكب في المجموعة الشمسية؟", options:["زحل","المشتري","نبتون"], answer:"المشتري"},
          {q:"عدد الكواكب في المجموعة الشمسية؟", options:["7","8","9"], answer:"8"},
        ]},
        { id:"l9", title:"البيئة والتلوث", content:"البيئة هي المحيط الذي نعيش فيه.\n\nأنواع التلوث:\n• تلوث الهواء: عوادم السيارات والمصانع\n• تلوث الماء: صرف المياه الملوثة في النهر\n• تلوث التربة: المبيدات الحشرية\n• تلوث صوتي: الضوضاء الشديدة\n\nطرق الحماية:\n✅ استخدام الطاقة المتجددة\n✅ إعادة التدوير\n✅ تقليل استخدام البلاستيك", video:"", questions:[
          {q:"أي من الآتي يسبب تلوث الهواء؟", options:["الأشجار","عوادم السيارات","المطر"], answer:"عوادم السيارات"},
          {q:"إعادة التدوير تساعد في؟", options:["زيادة التلوث","حماية البيئة","استهلاك الطاقة"], answer:"حماية البيئة"},
        ]},
      ]},
    ],
  },
  math: {
    label:"الرياضيات", emoji:"🔢", color:"#9c27b0", bg:"#f3e5f5", xp:25,
    units:[
      { id:"u1", title:"الأعداد", lessons:[
        { id:"l1", title:"الأعداد الكبيرة", content:"الأعداد الكبيرة وقراءتها:\n\n1,000 = ألف\n10,000 = عشرة آلاف\n100,000 = مئة ألف\n1,000,000 = مليون\n\nمثال: العدد 354,872\nنقرأه: ثلاثمائة وأربعة وخمسون ألفاً وثمانمائة واثنان وسبعون\n\nالخانات من اليمين:\n1. الآحاد\n2. العشرات\n3. المئات\n4. الآلاف\n5. عشرات الآلاف\n6. مئات الآلاف", video:"", questions:[
          {q:"1,000,000 يُقرأ؟", options:["ألف","مليون","مليار"], answer:"مليون"},
          {q:"خانة الآحاد في 3,456 هي؟", options:["3","4","6"], answer:"6"},
          {q:"أكبر عدد من الأرقام التالية؟", options:["9,999","10,000","9,000"], answer:"10,000"},
        ]},
        { id:"l2", title:"الكسور العادية", content:"الكسر العادي: يمثل جزءاً من كل.\n\nمثال: 3/4 يعني ثلاثة أرباع\n• البسط (فوق): عدد الأجزاء المأخوذة = 3\n• المقام (تحت): مجموع الأجزاء = 4\n\nأنواع الكسور:\n• الكسر الصحيح: البسط < المقام مثل 1/2، 3/4\n• الكسر غير الصحيح: البسط ≥ المقام مثل 5/4\n• العدد الكسري: مثل 1½\n\nجمع الكسور بمقام واحد:\n1/4 + 2/4 = 3/4", video:"", questions:[
          {q:"في الكسر 3/7، المقام هو؟", options:["3","7","10"], answer:"7"},
          {q:"1/4 + 2/4 = ؟", options:["2/8","3/4","3/8"], answer:"3/4"},
          {q:"الكسر الصحيح البسط فيه؟", options:["أكبر من المقام","أصغر من المقام","يساوي المقام"], answer:"أصغر من المقام"},
        ]},
        { id:"l3", title:"الكسور العشرية", content:"الكسر العشري يستخدم الفاصلة العشرية.\n\nمثال: 3.5 = ثلاثة وخمسة أعشار\n\nخانات الكسر العشري:\n• اليسار من الفاصلة: آحاد، عشرات، مئات...\n• اليمين من الفاصلة: أعشار، أجزاء من مئة...\n\nأمثلة:\n0.5 = نصف = 1/2\n0.25 = ربع = 1/4\n0.75 = ثلاثة أرباع = 3/4", video:"", questions:[
          {q:"0.5 يساوي؟", options:["1/4","1/3","1/2"], answer:"1/2"},
          {q:"0.25 يساوي؟", options:["1/4","1/2","3/4"], answer:"1/4"},
          {q:"1.5 + 0.5 = ؟", options:["1.0","2.0","1.5"], answer:"2.0"},
        ]},
      ]},
      { id:"u2", title:"العمليات الحسابية", lessons:[
        { id:"l4", title:"الجمع والطرح", content:"الجمع:\n• نبدأ من الآحاد إلى اليسار\n• إذا تجاوز مجموع خانة 9، نحمل للخانة التالية\n\nمثال: 347 + 486\n7+6=13 → نكتب 3 ونحمل 1\n4+8+1=13 → نكتب 3 ونحمل 1\n3+4+1=8\nالناتج: 833\n\nالطرح:\n• نبدأ من الآحاد\n• إذا كان العدد أصغر، نستعير من الخانة الأعلى", video:"", questions:[
          {q:"257 + 143 = ؟", options:["390","400","410"], answer:"400"},
          {q:"500 - 237 = ؟", options:["263","273","253"], answer:"263"},
          {q:"في الجمع، نبدأ من؟", options:["المئات","العشرات","الآحاد"], answer:"الآحاد"},
        ]},
        { id:"l5", title:"الضرب", content:"الضرب هو جمع متكرر.\n\nقواعد الضرب:\n• أي عدد × 0 = 0\n• أي عدد × 1 = نفس العدد\n• الضرب تبادلي: 3×4 = 4×3\n\nأمثلة مهمة:\n5 × 8 = 40\n7 × 6 = 42\n9 × 9 = 81\n12 × 12 = 144\n\nطريقة الضرب الطويل:\n34 × 5 = (30×5) + (4×5) = 150+20 = 170", video:"", questions:[
          {q:"7 × 8 = ؟", options:["54","56","58"], answer:"56"},
          {q:"9 × 9 = ؟", options:["72","81","90"], answer:"81"},
          {q:"أي عدد × 0 = ؟", options:["العدد نفسه","1","0"], answer:"0"},
        ]},
        { id:"l6", title:"القسمة", content:"القسمة هي التوزيع المتساوي.\n\nأجزاء عملية القسمة:\n• المقسوم: العدد الكبير\n• المقسوم عليه: عدد المجموعات\n• الناتج (الخارج): نصيب كل مجموعة\n• الباقي: ما تبقى (إن وُجد)\n\nمثال: 20 ÷ 4 = 5\n25 ÷ 4 = 6 باقي 1\n\nعلاقة الضرب والقسمة:\n5 × 4 = 20 → 20 ÷ 4 = 5", video:"", questions:[
          {q:"48 ÷ 6 = ؟", options:["7","8","9"], answer:"8"},
          {q:"25 ÷ 4 = ؟ (خارج وباقي)", options:["6 باقي 1","5 باقي 5","7 باقي 0"], answer:"6 باقي 1"},
          {q:"أي عدد ÷ نفسه = ؟", options:["0","2","1"], answer:"1"},
        ]},
      ]},
      { id:"u3", title:"الهندسة", lessons:[
        { id:"l7", title:"الأشكال الهندسية", content:"الأشكال الهندسية الأساسية:\n\n🔵 الدائرة: لا أضلاع، لا زوايا\n🔺 المثلث: 3 أضلاع، 3 زوايا\n⬜ المربع: 4 أضلاع متساوية، 4 زوايا قائمة\n▭ المستطيل: 4 أضلاع، ضلعان متساويان\n⬡ السداسي: 6 أضلاع، 6 زوايا\n\nمجموع زوايا المثلث = 180°\nمجموع زوايا المربع = 360°", video:"", questions:[
          {q:"عدد أضلاع المثلث؟", options:["2","3","4"], answer:"3"},
          {q:"مجموع زوايا المثلث؟", options:["90°","180°","360°"], answer:"180°"},
          {q:"المربع له أضلاع؟", options:["3","4","5"], answer:"4"},
        ]},
        { id:"l8", title:"المحيط والمساحة", content:"المحيط: مجموع أطوال أضلاع الشكل\nالمساحة: المساحة داخل الشكل\n\nقوانين:\n• محيط المربع = 4 × الضلع\n• مساحة المربع = الضلع × الضلع\n\n• محيط المستطيل = 2 × (الطول + العرض)\n• مساحة المستطيل = الطول × العرض\n\nمثال:\nمربع ضلعه 5 سم:\nالمحيط = 4×5 = 20 سم\nالمساحة = 5×5 = 25 سم²", video:"", questions:[
          {q:"مساحة مستطيل طوله 6 وعرضه 4؟", options:["20","24","10"], answer:"24"},
          {q:"محيط مربع ضلعه 7 سم؟", options:["14 سم","21 سم","28 سم"], answer:"28 سم"},
          {q:"مساحة مربع ضلعه 5 سم؟", options:["10 سم²","20 سم²","25 سم²"], answer:"25 سم²"},
        ]},
        { id:"l9", title:"الزوايا والخطوط", content:"أنواع الزوايا:\n\n📐 الزاوية القائمة = 90° (كزاوية المربع)\n🔺 الزاوية الحادة < 90° (أصغر من القائمة)\n🔻 الزاوية المنفرجة > 90° وأقل من 180°\n📏 الزاوية المستقيمة = 180°\n\nالخطوط:\n• خطوط متوازية: لا تتقاطع أبداً\n• خطوط متعامدة: تتقاطع بزاوية 90°", video:"", questions:[
          {q:"الزاوية القائمة = ؟", options:["45°","90°","180°"], answer:"90°"},
          {q:"زاوية 120° هي؟", options:["حادة","قائمة","منفرجة"], answer:"منفرجة"},
          {q:"الخطوط المتوازية؟", options:["تتقاطع دائماً","لا تتقاطع أبداً","تتقاطع أحياناً"], answer:"لا تتقاطع أبداً"},
        ]},
      ]},
    ],
  },
  it: {
    label:"تكنولوجيا المعلومات", emoji:"💻", color:"#00bcd4", bg:"#e0f7fa", xp:20,
    units:[
      { id:"u1", title:"الحاسب الآلي", lessons:[
        { id:"l1", title:"مكونات الحاسب", content:"الحاسب الآلي له مكونان رئيسيان:\n\n🔧 المكونات المادية (Hardware):\n• وحدة المعالجة المركزية (CPU) - عقل الحاسب\n• الذاكرة العشوائية (RAM) - للتخزين المؤقت\n• القرص الصلب - للتخزين الدائم\n• الشاشة - عرض المعلومات\n• لوحة المفاتيح والفأرة - الإدخال\n• الطابعة - الإخراج\n\n💿 المكونات البرمجية (Software):\n• نظام التشغيل (Windows, Mac)\n• البرامج والتطبيقات", video:"", questions:[
          {q:"عقل الحاسب يُسمى؟", options:["RAM","CPU","القرص الصلب"], answer:"CPU"},
          {q:"الشاشة تُعتبر وحدة؟", options:["إدخال","إخراج","تخزين"], answer:"إخراج"},
          {q:"لوحة المفاتيح تُعتبر وحدة؟", options:["إدخال","إخراج","معالجة"], answer:"إدخال"},
        ]},
        { id:"l2", title:"نظام التشغيل", content:"نظام التشغيل هو البرنامج الأساسي الذي يدير الحاسب.\n\nأشهر أنظمة التشغيل:\n• Windows: الأكثر انتشاراً للحواسب المكتبية\n• macOS: لأجهزة Apple\n• Linux: مجاني ومفتوح المصدر\n• Android: للأجهزة المحمولة\n• iOS: لأجهزة iPhone\n\nمهام نظام التشغيل:\n✅ تشغيل البرامج\n✅ إدارة الملفات\n✅ التحكم في الأجهزة\n✅ توفير واجهة المستخدم", video:"", questions:[
          {q:"نظام Windows من صنع؟", options:["Apple","Microsoft","Google"], answer:"Microsoft"},
          {q:"نظام iOS يعمل على؟", options:["أجهزة Samsung","أجهزة Apple","أجهزة LG"], answer:"أجهزة Apple"},
          {q:"مهمة نظام التشغيل؟", options:["فقط تشغيل الألعاب","إدارة الحاسب وتشغيل البرامج","فقط الاتصال بالإنترنت"], answer:"إدارة الحاسب وتشغيل البرامج"},
        ]},
        { id:"l3", title:"البرامج والتطبيقات", content:"البرامج هي التعليمات التي تخبر الحاسب بما يجب فعله.\n\nأنواع البرامج:\n📝 برامج المعالجة النصية: Microsoft Word\n📊 برامج الجداول: Microsoft Excel\n🖼️ برامج التصميم: Photoshop\n🌐 متصفحات الإنترنت: Chrome, Firefox\n🎮 الألعاب\n\nالفرق بين التطبيق والبرنامج:\n• البرنامج: مصطلح عام\n• التطبيق (App): برنامج صغير للهاتف المحمول عادةً", video:"", questions:[
          {q:"Microsoft Word برنامج لـ؟", options:["تحرير الصور","معالجة النصوص","الألعاب"], answer:"معالجة النصوص"},
          {q:"متصفح الإنترنت مثل Chrome يُستخدم لـ؟", options:["تحرير الفيديو","تصفح الإنترنت","كتابة النصوص"], answer:"تصفح الإنترنت"},
        ]},
      ]},
      { id:"u2", title:"الإنترنت", lessons:[
        { id:"l4", title:"ما هو الإنترنت؟", content:"الإنترنت هو شبكة عملاقة تربط ملايين الأجهزة حول العالم.\n\nما يمكن فعله بالإنترنت:\n🔍 البحث عن المعلومات\n📧 إرسال واستقبال الرسائل\n🎥 مشاهدة الفيديوهات\n🛍️ التسوق الإلكتروني\n📚 التعلم عن بُعد\n📞 التواصل مع الأهل\n\nكيف يعمل الإنترنت:\nجهازك ← الراوتر ← خدمة الإنترنت (ISP) ← الشبكة العالمية", video:"", questions:[
          {q:"الإنترنت هو؟", options:["برنامج واحد","شبكة عالمية من الأجهزة","نوع من الحواسب"], answer:"شبكة عالمية من الأجهزة"},
          {q:"ISP تعني؟", options:["نوع حاسب","مزود خدمة الإنترنت","برنامج إنترنت"], answer:"مزود خدمة الإنترنت"},
        ]},
        { id:"l5", title:"محركات البحث", content:"محركات البحث تساعدك في العثور على المعلومات.\n\nأشهر محركات البحث:\n🔍 Google: الأكثر استخداماً في العالم\n🔎 Bing: من Microsoft\n🦆 DuckDuckGo: يحافظ على الخصوصية\n\nكيف تبحث بفعالية:\n✅ استخدم كلمات مفتاحية محددة\n✅ استخدم علامات الاقتباس للعبارات الدقيقة\n✅ تحقق من مصداقية المصدر\n✅ قارن بين أكثر من مصدر", video:"", questions:[
          {q:"أشهر محركات البحث؟", options:["Yahoo","Google","Bing"], answer:"Google"},
          {q:"لتبحث عن عبارة بالكامل تستخدم؟", options:["علامة النجمة *","علامات الاقتباس","الفاصلة ,"], answer:"علامات الاقتباس"},
        ]},
        { id:"l6", title:"البريد الإلكتروني", content:"البريد الإلكتروني (Email) وسيلة للتواصل عبر الإنترنت.\n\nمكونات عنوان البريد:\nاسم_المستخدم@اسم_الخدمة.com\nمثال: ahmed@gmail.com\n\nأجزاء الرسالة الإلكترونية:\n📌 إلى (To): عنوان المرسل إليه\n📋 الموضوع (Subject): موضوع الرسالة\n✉️ النص: محتوى الرسالة\n📎 المرفقات: ملفات مرفقة\n\nأشهر خدمات البريد: Gmail, Outlook, Yahoo Mail", video:"", questions:[
          {q:"رمز @ في البريد الإلكتروني يعني؟", options:["نهاية العنوان","يفصل الاسم عن خدمة البريد","بداية العنوان"], answer:"يفصل الاسم عن خدمة البريد"},
          {q:"أشهر خدمات البريد الإلكتروني؟", options:["Google Chrome","Gmail","Google Maps"], answer:"Gmail"},
        ]},
      ]},
      { id:"u3", title:"الأمان الرقمي", lessons:[
        { id:"l7", title:"كلمة المرور الآمنة", content:"كلمة المرور القوية تحمي حساباتك!\n\nمواصفات كلمة المرور القوية:\n✅ 8 أحرف على الأقل\n✅ تحتوي على أحرف كبيرة وصغيرة\n✅ تحتوي على أرقام\n✅ تحتوي على رموز مثل @#$%\n✅ لا تحتوي على اسمك أو تاريخ ميلادك\n\nمثال على كلمة مرور قوية:\nMyP@ss123# ✅\nahmad123 ❌ (ضعيفة)\n\nتذكر: لا تشارك كلمة مرورك مع أحد!", video:"", questions:[
          {q:"كلمة المرور القوية يجب أن تكون؟", options:["اسمك فقط","8 أحرف على الأقل مع أرقام ورموز","تاريخ ميلادك"], answer:"8 أحرف على الأقل مع أرقام ورموز"},
          {q:"هل يجب مشاركة كلمة مرورك مع صديقك؟", options:["نعم دائماً","لا أبداً","أحياناً"], answer:"لا أبداً"},
        ]},
        { id:"l8", title:"الخصوصية على الإنترنت", content:"الخصوصية الرقمية مهمة جداً!\n\nقواعد السلامة على الإنترنت:\n🚫 لا تشارك معلوماتك الشخصية مع غرباء\n🚫 لا تلتقي بأشخاص تعرفت عليهم عبر الإنترنت\n✅ أخبر والديك إذا رأيت شيئاً مزعجاً\n✅ استخدم إعدادات الخصوصية في التطبيقات\n✅ لا تفتح روابط من مجهولين\n\nالمعلومات التي لا تشاركها:\n❌ عنوان منزلك\n❌ رقم هاتفك\n❌ كلمات مرورك\n❌ صور شخصية لغرباء", video:"", questions:[
          {q:"إذا رأيت شيئاً مزعجاً على الإنترنت؟", options:["تكمل الاطلاع","تخبر والديك","تشاركه مع أصدقائك"], answer:"تخبر والديك"},
          {q:"المعلومات التي لا تشاركها على الإنترنت؟", options:["اسمك فقط","عنوان منزلك وكلمات مرورك","لونك المفضل"], answer:"عنوان منزلك وكلمات مرورك"},
        ]},
        { id:"l9", title:"الفيروسات والحماية", content:"فيروسات الحاسب برامج ضارة تؤذي جهازك.\n\nأنواع البرامج الضارة:\n🦠 الفيروس (Virus): ينتشر ويُتلف الملفات\n🐛 الدودة (Worm): تنتشر عبر الشبكات\n🎭 حصان طروادة (Trojan): يتنكر كبرنامج مفيد\n💰 برامج الفدية: تطلب مالاً لاسترداد ملفاتك\n\nطرق الحماية:\n✅ تثبيت برنامج مكافحة الفيروسات\n✅ تحديث النظام بانتظام\n✅ لا تحمل برامج من مصادر مجهولة\n✅ لا تفتح مرفقات من مجهولين", video:"", questions:[
          {q:"أفضل طريقة للحماية من الفيروسات؟", options:["إطفاء الحاسب","تثبيت برنامج مكافح الفيروسات","تقليل استخدام الإنترنت"], answer:"تثبيت برنامج مكافح الفيروسات"},
          {q:"الفيروس (Virus) هو؟", options:["برنامج مفيد","برنامج ضار يتلف الملفات","نوع من الحواسب"], answer:"برنامج ضار يتلف الملفات"},
        ]},
      ]},
    ],
  },
};

const SUBJECTS = Object.entries(CURRICULUM).map(([id, data]) => ({
  id, label:data.label, emoji:data.emoji, color:data.color, bg:data.bg, xp:data.xp,
}));

// ── Sound Helper ───────────────────────────────────────────────────────────────
function playBeep(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === "correct") { o.frequency.value = 880; g.gain.setValueAtTime(0.3, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4); }
    else if (type === "wrong") { o.frequency.value = 220; o.type = "sawtooth"; g.gain.setValueAtTime(0.3, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); }
    else { o.frequency.value = 660; g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6); }
    o.start(); o.stop(ctx.currentTime + 0.6);
  } catch(e) {}
}

// ── CSS ────────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Fredoka+One&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#4caf50;--green-d:#388e3c;--green-sh:#2e7d32;
  --blue:#1cb0f6;--blue-d:#0a91d1;
  --red:#f44336;--orange:#ff9600;--yellow:#ffd900;--purple:#9c27b0;
  --bg:#f5f5f5;--card:#fff;--text:#212121;--muted:#9e9e9e;--border:#e0e0e0;
}
body{font-family:'Tajawal',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;direction:rtl}
.app{min-height:100vh;display:flex;flex-direction:column}
@keyframes pop   {0%{transform:scale(.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes up    {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes pulse {0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
@keyframes glow  {0%,100%{box-shadow:0 0 10px rgba(76,175,80,.3)}50%{box-shadow:0 0 25px rgba(76,175,80,.7)}}
.pop{animation:pop .35s cubic-bezier(.34,1.56,.64,1) both}
.up {animation:up .4s ease both}

/* TOPBAR */
.topbar{background:#fff;border-bottom:2px solid var(--border);padding:0 20px;height:62px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.logo{font-family:'Fredoka One',cursive;font-size:24px;color:var(--green);cursor:pointer;display:flex;align-items:center;gap:6px}
.logo span{color:var(--blue)}
.tb-center{display:flex;align-items:center;gap:12px}
.pill{display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;font-weight:800;font-size:14px;border:2px solid}
.pill-y{background:#fff8e0;border-color:var(--yellow);color:#c8910a}
.pill-o{background:#fff0e0;border-color:var(--orange);color:var(--orange);animation:pulse 2s infinite}
.tb-right{display:flex;align-items:center;gap:8px}
.avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--green),var(--blue));border:3px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;cursor:pointer;transition:transform .2s}
.avatar:hover{transform:scale(1.08)}
.ghost-btn{background:#fff;border:2px solid var(--border);color:var(--muted);padding:7px 14px;border-radius:10px;cursor:pointer;font-family:'Tajawal',sans-serif;font-weight:700;font-size:13px;transition:all .2s}
.ghost-btn:hover{border-color:var(--red);color:var(--red)}
.blue-ghost{border-color:var(--blue)!important;color:var(--blue)!important}

/* AUTH */
.auth-page{flex:1;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#e8f5e9 0%,#e0f7fa 50%,#f3e5f5 100%);padding:20px}
.auth-box{background:#fff;border-radius:24px;box-shadow:0 8px 40px rgba(0,0,0,.1);padding:36px 32px;width:100%;max-width:400px;animation:pop .4s cubic-bezier(.34,1.56,.64,1)}
.auth-owl{font-size:60px;text-align:center;margin-bottom:6px;animation:bounce 2s infinite}
.auth-title{font-family:'Fredoka One',cursive;font-size:28px;text-align:center;color:var(--green);margin-bottom:2px}
.auth-sub{text-align:center;color:var(--muted);font-size:14px;font-weight:600;margin-bottom:20px}
.auth-tabs{display:flex;background:#f5f5f5;border-radius:12px;padding:4px;margin-bottom:18px}
.atab{flex:1;padding:9px;border:none;background:transparent;font-family:'Tajawal',sans-serif;font-weight:800;font-size:14px;border-radius:9px;cursor:pointer;color:var(--muted);transition:all .2s}
.atab.on{background:#fff;color:var(--text);box-shadow:0 2px 8px rgba(0,0,0,.1)}
.field{margin-bottom:13px}
.field label{font-size:13px;font-weight:800;display:block;margin-bottom:4px}
.field input{width:100%;padding:12px 14px;border:2px solid var(--border);border-radius:11px;font-family:'Tajawal',sans-serif;font-size:14px;color:var(--text);outline:none;transition:border-color .2s;direction:ltr;background:#fafafa}
.field input:focus{border-color:var(--green);background:#fff}
.field input.err{border-color:var(--red);animation:shake .3s}
.green-btn{width:100%;padding:14px;background:var(--green);border:none;border-radius:13px;color:#fff;font-family:'Tajawal',sans-serif;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 var(--green-sh);transition:all .15s}
.green-btn:hover{filter:brightness(1.05);transform:translateY(-1px)}
.green-btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--green-sh)}
.green-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:0 4px 0 var(--green-sh)}
.err-msg{color:var(--red);font-size:13px;font-weight:700;text-align:center;margin-top:8px}

/* HOME */
.home{flex:1;max-width:920px;margin:0 auto;width:100%;padding:24px 16px}
.banner{background:linear-gradient(135deg,var(--green),#66bb6a);border-radius:20px;padding:22px 26px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 6px 0 var(--green-sh);animation:up .4s ease}
.banner h2{font-family:'Fredoka One',cursive;font-size:24px;color:#fff;margin-bottom:3px}
.banner p{color:rgba(255,255,255,.85);font-size:13px;font-weight:700}
.owl-big{font-size:52px;animation:bounce 2s infinite}
.sec-title{font-family:'Fredoka One',cursive;font-size:20px;margin-bottom:14px}
.subj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:14px;margin-bottom:28px}
.subj-card{background:#fff;border-radius:18px;padding:22px 18px;cursor:pointer;border:3px solid transparent;box-shadow:0 4px 0 rgba(0,0,0,.07);transition:transform .2s,box-shadow .2s;text-align:center;position:relative;overflow:hidden;animation:up .4s ease both}
.subj-card::before{content:'';position:absolute;top:0;left:0;right:0;height:5px;background:var(--c)}
.subj-card:hover{transform:translateY(-4px);box-shadow:0 8px 0 rgba(0,0,0,.1)}
.s-emoji{font-size:42px;margin-bottom:8px;display:block}
.s-name{font-family:'Fredoka One',cursive;font-size:18px}
.s-meta{font-size:11px;color:var(--muted);font-weight:700;margin-top:3px}
.s-xp{display:inline-block;margin-top:8px;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:900;background:var(--sbg);color:var(--c)}
.streak-box{background:#fff;border-radius:18px;padding:18px 22px;box-shadow:0 4px 0 rgba(0,0,0,.05)}
.streak-days{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}
.sday{flex:1;min-width:34px;text-align:center;padding:7px 3px;border-radius:9px;border:2px solid var(--border);font-size:9px;font-weight:800;color:var(--muted)}
.sday.done{background:#fff8e0;border-color:var(--orange);color:var(--orange)}
.sday span{font-size:16px;display:block;margin-bottom:2px}

/* SUBJECT PAGE */
.subj-page{flex:1;max-width:760px;margin:0 auto;width:100%;padding:24px 16px}
.back-btn{display:inline-flex;align-items:center;gap:6px;background:#fff;border:2px solid var(--border);border-radius:10px;padding:7px 14px;cursor:pointer;font-family:'Tajawal',sans-serif;font-weight:800;font-size:13px;color:var(--text);margin-bottom:18px;transition:all .2s;box-shadow:0 2px 0 var(--border)}
.back-btn:hover{border-color:var(--blue);color:var(--blue)}
.subj-hdr{background:#fff;border-radius:18px;padding:22px;display:flex;align-items:center;gap:18px;margin-bottom:22px;box-shadow:0 4px 0 rgba(0,0,0,.05);animation:pop .35s cubic-bezier(.34,1.56,.64,1)}
.subj-icon{width:68px;height:68px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:34px;flex-shrink:0}
.subj-hdr-title{font-family:'Fredoka One',cursive;font-size:24px}
.subj-hdr-sub{color:var(--muted);font-size:12px;font-weight:700;margin-top:2px}
.units-list{display:flex;flex-direction:column;gap:16px}
.unit-block{background:#fff;border-radius:16px;border:2px solid var(--border);box-shadow:0 3px 0 var(--border);overflow:hidden;animation:up .4s ease both}
.unit-hdr{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:background .15s}
.unit-hdr:hover{background:#fafafa}
.unit-title{font-family:'Fredoka One',cursive;font-size:17px}
.unit-meta{font-size:12px;color:var(--muted);font-weight:700;margin-top:1px}
.unit-arrow{font-size:18px;color:var(--muted);transition:transform .2s}
.unit-arrow.open{transform:rotate(90deg)}
.unit-lessons{border-top:2px solid var(--border)}
.lesson-row{padding:13px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border);cursor:pointer;transition:all .15s}
.lesson-row:last-child{border-bottom:none}
.lesson-row:hover{background:#f8f8f8;transform:translateX(-2px)}
.l-num{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px}
.l-name{font-size:15px;font-weight:800}
.l-sub{font-size:11px;color:var(--muted);font-weight:600;margin-top:1px}
.l-badge{margin-right:auto;font-size:13px}
.unit-quiz-btn{display:block;width:calc(100% - 36px);margin:14px 18px;padding:13px;background:var(--green);border:none;border-radius:12px;color:#fff;font-family:'Tajawal',sans-serif;font-size:16px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 var(--green-sh);transition:all .15s;text-align:center}
.unit-quiz-btn:hover{filter:brightness(1.05);transform:translateY(-2px);box-shadow:0 6px 0 var(--green-sh)}

/* LESSON PAGE */
.lesson-page{flex:1;max-width:760px;margin:0 auto;width:100%;padding:24px 16px}
.lesson-card{background:#fff;border-radius:18px;padding:24px;box-shadow:0 4px 0 rgba(0,0,0,.06);margin-bottom:18px;animation:up .4s ease}
.lesson-title{font-family:'Fredoka One',cursive;font-size:22px;margin-bottom:14px}
.lesson-content{font-size:15px;line-height:1.8;white-space:pre-line;color:#333}
.video-wrap{border-radius:14px;overflow:hidden;margin:16px 0;background:#000;aspect-ratio:16/9}
.video-wrap iframe{width:100%;height:100%;border:none}
.no-video{padding:18px;text-align:center;background:#fafafa;border-radius:12px;color:var(--muted);font-size:14px;font-weight:700;border:2px dashed var(--border)}
.lesson-quiz-section{margin-top:18px}
.lq-title{font-family:'Fredoka One',cursive;font-size:18px;margin-bottom:14px;color:var(--purple)}
.lq-item{background:#fff;border:2px solid var(--border);border-radius:14px;padding:16px;margin-bottom:12px;box-shadow:0 3px 0 var(--border)}
.lq-q{font-size:15px;font-weight:800;margin-bottom:10px}
.lq-opts{display:flex;flex-direction:column;gap:8px}
.lq-opt{padding:11px 14px;border:2px solid var(--border);border-radius:10px;cursor:pointer;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:700;text-align:right;transition:all .15s;background:#fff;display:flex;align-items:center;gap:10px}
.lq-opt:hover:not(.locked){border-color:var(--blue);background:#f0f8ff}
.lq-opt.correct{border-color:var(--green);background:#f0fff0;color:var(--green-d)}
.lq-opt.wrong{border-color:var(--red);background:#fff0f0;color:var(--red);animation:shake .3s}
.lq-opt.locked{pointer-events:none}
.lq-dot{width:28px;height:28px;border-radius:7px;background:var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;flex-shrink:0}
.lq-opt.correct .lq-dot{background:var(--green);color:#fff}
.lq-opt.wrong   .lq-dot{background:var(--red);color:#fff}
.lesson-score{background:linear-gradient(135deg,#e8f5e9,#f3e5f5);border-radius:16px;padding:20px;text-align:center;border:2px solid var(--green)}
.ls-title{font-family:'Fredoka One',cursive;font-size:22px;color:var(--green);margin-bottom:4px}
.ls-sub{color:var(--muted);font-size:14px;font-weight:700;margin-bottom:16px}
.ls-score{font-family:'Fredoka One',cursive;font-size:40px;color:var(--green)}
.stars{font-size:28px;margin:10px 0}
.ls-xp{background:#fff8e0;border:2px solid var(--yellow);border-radius:12px;padding:8px 16px;display:inline-block;font-weight:900;font-size:15px;color:#c8910a;margin-bottom:16px}
.ls-btns{display:flex;gap:10px;justify-content:center}
.btn-sm{padding:10px 22px;border-radius:11px;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:900;cursor:pointer;transition:all .15s}
.btn-sm-g{background:var(--green);border:none;color:#fff;box-shadow:0 3px 0 var(--green-sh)}
.btn-sm-o{background:#fff;border:2px solid var(--border);color:var(--text)}
.btn-sm-o:hover{border-color:var(--blue);color:var(--blue)}
.progress-bar-wrap{margin-top:10px}
.pb-label{font-size:12px;font-weight:800;color:var(--muted);display:flex;justify-content:space-between;margin-bottom:4px}
.pb-track{height:10px;background:var(--border);border-radius:6px;overflow:hidden}
.pb-fill{height:100%;border-radius:6px;transition:width .6s cubic-bezier(.34,1.56,.64,1)}

/* UNIT QUIZ */
.quiz-page{flex:1;max-width:680px;margin:0 auto;width:100%;padding:24px 16px}
.quiz-top{display:flex;align-items:center;gap:14px;margin-bottom:22px}
.prog-track{flex:1;height:14px;background:var(--border);border-radius:8px;overflow:hidden}
.prog-fill{height:100%;border-radius:8px;transition:width .5s cubic-bezier(.34,1.56,.64,1)}
.lives{display:flex;gap:3px}
.heart{font-size:20px;transition:all .2s}
.heart.lost{filter:grayscale(1);opacity:.35}
.q-label{font-size:12px;font-weight:800;color:var(--muted);margin-bottom:8px}
.q-text{font-family:'Fredoka One',cursive;font-size:24px;line-height:1.4;margin-bottom:24px}
.opts{display:flex;flex-direction:column;gap:10px}
.opt{background:#fff;border:3px solid var(--border);border-radius:14px;padding:14px 18px;font-family:'Tajawal',sans-serif;font-size:15px;font-weight:800;color:var(--text);cursor:pointer;text-align:right;transition:all .15s;display:flex;align-items:center;gap:12px;box-shadow:0 4px 0 var(--border)}
.opt:hover:not(.locked){border-color:var(--blue);box-shadow:0 4px 0 rgba(28,176,246,.3);transform:translateY(-2px)}
.opt.correct{border-color:var(--green);background:#f0fff0;box-shadow:0 4px 0 var(--green-d);animation:pop .3s cubic-bezier(.34,1.56,.64,1)}
.opt.wrong{border-color:var(--red);background:#fff0f0;box-shadow:0 4px 0 #c00;animation:shake .3s}
.opt.locked{pointer-events:none}
.opt-l{width:30px;height:30px;border-radius:8px;flex-shrink:0;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900}
.opt.correct .opt-l{background:var(--green);color:#fff}
.opt.wrong   .opt-l{background:var(--red);color:#fff}
.feedback{margin-top:18px;padding:16px 20px;border-radius:14px;display:flex;align-items:center;justify-content:space-between;animation:pop .3s cubic-bezier(.34,1.56,.64,1)}
.feedback.good{background:#f0fff0;border:2px solid var(--green)}
.feedback.bad {background:#fff0f0;border:2px solid var(--red)}
.fb-msg{font-size:15px;font-weight:900}
.feedback.good .fb-msg{color:var(--green)}
.feedback.bad  .fb-msg{color:var(--red)}
.fb-next{padding:10px 20px;border:none;border-radius:11px;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:900;cursor:pointer;transition:all .15s}
.feedback.good .fb-next{background:var(--green);color:#fff;box-shadow:0 4px 0 var(--green-d)}
.feedback.bad  .fb-next{background:var(--red);color:#fff;box-shadow:0 4px 0 #a00}
.fb-next:hover{filter:brightness(1.07);transform:translateY(-1px)}

/* RESULTS */
.res-page{flex:1;display:flex;align-items:center;justify-content:center;padding:22px;background:linear-gradient(160deg,#e8f5e9 0%,#e0f7fa 60%,#f3e5f5 100%)}
.res-card{background:#fff;border-radius:26px;padding:44px 36px;text-align:center;max-width:440px;width:100%;box-shadow:0 12px 40px rgba(0,0,0,.1);animation:pop .5s cubic-bezier(.34,1.56,.64,1)}
.res-trophy{font-size:72px;margin-bottom:14px;animation:bounce 1.5s infinite}
.res-title{font-family:'Fredoka One',cursive;font-size:30px;margin-bottom:4px}
.res-sub{color:var(--muted);font-size:14px;font-weight:700;margin-bottom:20px;line-height:1.5}
.score-ring{width:120px;height:120px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 18px;border:8px solid}
.score-ring .sn{font-family:'Fredoka One',cursive;font-size:32px}
.score-ring .sl{font-size:12px;font-weight:700;opacity:.7}
.xp-tag{background:#fff8e0;border:2px solid var(--yellow);border-radius:12px;padding:10px 18px;margin-bottom:18px;font-weight:900;font-size:15px;color:#c8910a}
.res-btns{display:flex;gap:10px}
.btn-out{flex:1;padding:13px;background:#fff;border:3px solid var(--border);border-radius:13px;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:900;color:var(--text);cursor:pointer;transition:all .2s;box-shadow:0 4px 0 var(--border)}
.btn-out:hover{border-color:var(--blue);color:var(--blue)}
.btn-fill{flex:1;padding:13px;background:var(--green);border:none;border-radius:13px;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:900;color:#fff;cursor:pointer;box-shadow:0 4px 0 var(--green-sh);transition:all .15s}
.btn-fill:hover{filter:brightness(1.05);transform:translateY(-1px)}

/* ADMIN */
.admin-page{flex:1;max-width:960px;margin:0 auto;width:100%;padding:24px 16px}
.admin-tabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.a-tab{padding:9px 18px;border-radius:11px;border:2px solid var(--border);background:#fff;font-family:'Tajawal',sans-serif;font-weight:800;font-size:13px;cursor:pointer;color:var(--muted);transition:all .2s;box-shadow:0 3px 0 var(--border)}
.a-tab.on{background:var(--green);border-color:var(--green);color:#fff;box-shadow:0 3px 0 var(--green-sh)}
.stats-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px;margin-bottom:20px}
.stat-box{background:#fff;border-radius:16px;padding:18px;text-align:center;box-shadow:0 4px 0 rgba(0,0,0,.05);animation:up .4s ease both}
.stat-n{font-family:'Fredoka One',cursive;font-size:34px}
.stat-l{font-size:12px;color:var(--muted);font-weight:700;margin-top:2px}
.tbl-wrap{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 0 rgba(0,0,0,.05);overflow-x:auto}
table{width:100%;border-collapse:collapse;min-width:500px}
th,td{padding:12px 16px;text-align:right;font-size:13px}
th{color:var(--muted);font-weight:800;background:#fafafa;border-bottom:2px solid var(--border)}
tr:not(:last-child) td{border-bottom:1px solid var(--border)}
tr:hover td{background:#fafafa}
.badge{display:inline-block;padding:3px 10px;border-radius:18px;font-size:11px;font-weight:900}
.bg{background:#e8f5e9;color:var(--green-sh)}
.by{background:#fff8e0;color:#c8910a}
.br{background:#ffebee;color:var(--red)}
.empty{text-align:center;padding:44px;color:var(--muted);font-size:14px;font-weight:700}
.empty div{font-size:44px;margin-bottom:10px}
.admin-form{background:#fff;border-radius:16px;padding:22px;box-shadow:0 4px 0 rgba(0,0,0,.05);margin-bottom:18px;animation:up .4s ease}
.af-title{font-family:'Fredoka One',cursive;font-size:18px;margin-bottom:16px;color:var(--blue)}
.af-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
.af-field{flex:1;min-width:200px}
.af-field label{font-size:12px;font-weight:800;display:block;margin-bottom:4px;color:var(--muted)}
.af-field input,.af-field textarea,.af-field select{width:100%;padding:10px 12px;border:2px solid var(--border);border-radius:10px;font-family:'Tajawal',sans-serif;font-size:13px;outline:none;transition:border-color .2s;background:#fafafa}
.af-field input:focus,.af-field textarea:focus,.af-field select:focus{border-color:var(--blue);background:#fff}
.af-field textarea{resize:vertical;min-height:80px}
.af-btn{padding:10px 22px;background:var(--blue);border:none;border-radius:10px;color:#fff;font-family:'Tajawal',sans-serif;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 var(--blue-d);transition:all .15s}
.af-btn:hover{filter:brightness(1.05);transform:translateY(-1px)}
.af-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
.q-item-admin{background:#f9f9f9;border:2px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px}
.q-add-btn{padding:8px 16px;background:#fff;border:2px dashed var(--border);border-radius:10px;color:var(--muted);font-family:'Tajawal',sans-serif;font-size:13px;font-weight:700;cursor:pointer;width:100%;margin-top:6px;transition:all .2s}
.q-add-btn:hover{border-color:var(--blue);color:var(--blue)}
.del-btn{padding:4px 10px;background:none;border:1px solid var(--red);border-radius:8px;color:var(--red);font-size:11px;font-weight:800;cursor:pointer;transition:all .2s}
.del-btn:hover{background:var(--red);color:#fff}
.success-msg{background:#e8f5e9;border:2px solid var(--green);border-radius:10px;padding:10px 14px;color:var(--green-sh);font-weight:800;font-size:13px;margin-top:10px;text-align:center}

@media(max-width:600px){
  .tb-center{display:none}
  .owl-big{display:none}
  .subj-grid{grid-template-columns:1fr 1fr}
  .q-text{font-size:18px}
  .res-card{padding:32px 18px}
  .res-btns{flex-direction:column}
  .auth-box{padding:28px 18px}
  .banner{padding:16px 18px}
  .banner h2{font-size:20px}
}
`;

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,      setUser]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState("home");
  const [activeSub, setActiveSub] = useState(null);
  const [activeUnit,setActiveUnit]= useState(null);
  const [activeLesson,setActiveLesson] = useState(null);
  const [quizRes,   setQuizRes]   = useState(null);
  const [userData,  setUserData]  = useState({ xp:0, streak:0, results:[], name:"" });
  const [quizMode,  setQuizMode]  = useState("unit"); // "unit" | "lesson"

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const snap = await get(ref(db, `users/${u.uid}`));
        if (snap.exists()) {
          setUserData(snap.val());
        } else {
          const init = { xp:0, streak:0, results:[], name: u.displayName||"طالب", role:"student", lessonProgress:{} };
          await set(ref(db, `users/${u.uid}`), init);
          setUserData(init);
        }
        setPage("home");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveUser = async (data) => {
    if (!user) return;
    await set(ref(db, `users/${user.uid}`), data);
    setUserData(data);
  };

  const handleQuizDone = async (score, total, type = "unit") => {
    const sub   = activeSub;
    const earned = Math.round((score / total) * sub.xp);
    const label  = type === "lesson" ? `درس: ${activeLesson?.title}` : `وحدة: ${activeUnit?.title}`;
    const entry  = { subject:sub.id, label, score, total, xp:earned, date: new Date().toLocaleDateString("ar-EG"), ts: Date.now() };
    const lp     = userData.lessonProgress || {};
    if (type === "lesson") lp[`${sub.id}_${activeUnit?.id}_${activeLesson?.id}`] = { score, total, done:true };
    const newData = { ...userData, xp:(userData.xp||0)+earned, results:[...(userData.results||[]), entry], lessonProgress:lp };
    await saveUser(newData);
    setQuizRes({ score, total, xp:earned });
    setPage("results");
  };

  const goHome = () => { setPage("home"); setActiveSub(null); setActiveUnit(null); setActiveLesson(null); };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontSize:54,flexDirection:"column",gap:12}}>
        <span style={{animation:"bounce 1s infinite"}}>🎓</span>
        <div style={{fontSize:16,color:"#9e9e9e",fontFamily:"Tajawal,sans-serif"}}>جاري التحميل...</div>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {user && (
          <Topbar
            user={user} userData={userData}
            onLogout={async () => { await signOut(auth); setUser(null); setPage("home"); }}
            onHome={goHome}
            onAdmin={() => setPage("admin")}
            isAdmin={userData.role === "admin"}
          />
        )}
        {!user                     && <AuthPage />}
        {user && page==="home"     && <HomePage userData={userData} onSubject={s => { setActiveSub(s); setPage("subject"); }} />}
        {user && page==="subject"  && <SubjectPage subject={activeSub} userData={userData} onBack={goHome} onLesson={(u,l) => { setActiveUnit(u); setActiveLesson(l); setPage("lesson"); }} onUnitQuiz={(u) => { setActiveUnit(u); setQuizMode("unit"); setPage("quiz"); }} />}
        {user && page==="lesson"   && <LessonPage lesson={activeLesson} unit={activeUnit} subject={activeSub} userData={userData} onBack={() => setPage("subject")} onQuizDone={(s,t) => { handleQuizDone(s,t,"lesson"); }} />}
        {user && page==="quiz"     && <QuizPage subject={activeSub} unit={activeUnit} onBack={() => setPage("subject")} onDone={(s,t) => handleQuizDone(s,t,"unit")} />}
        {user && page==="results"  && <ResultsPage result={quizRes} subject={activeSub} onHome={goHome} onRetry={() => setPage(quizMode==="lesson"?"lesson":"quiz")} />}
        {user && page==="admin"    && <AdminPage onBack={goHome} />}
      </div>
    </>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────────
function Topbar({ user, userData, onLogout, onHome, onAdmin, isAdmin }) {
  return (
    <div className="topbar">
      <div className="logo" onClick={onHome}>🎓 <span style={{color:"#4caf50"}}>Edu</span><span>Grade5</span></div>
      <div className="tb-center">
        <div className="pill pill-o">🔥 {userData.streak||1} يوم</div>
        <div className="pill pill-y">⚡ {userData.xp||0} XP</div>
      </div>
      <div className="tb-right">
        {isAdmin && <button className="ghost-btn blue-ghost" onClick={onAdmin}>🛠️ أدمن</button>}
        <div className="avatar">{(user.displayName||user.email)?.[0]?.toUpperCase()||"؟"}</div>
        <button className="ghost-btn" onClick={onLogout}>خروج</button>
      </div>
    </div>
  );
}

// ── Auth ───────────────────────────────────────────────────────────────────────
function AuthPage() {
  const [tab,  setTab]  = useState("login");
  const [name, setName] = useState("");
  const [email,setEmail]= useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const MSGS = {
    "auth/email-already-in-use":"الإيميل ده مستخدم بالفعل ❌",
    "auth/invalid-email":"إيميل غير صحيح ❌",
    "auth/weak-password":"الباسورد لازم 6 أحرف على الأقل ❌",
    "auth/user-not-found":"مفيش حساب بالإيميل ده ❌",
    "auth/wrong-password":"كلمة المرور غلط ❌",
    "auth/invalid-credential":"الإيميل أو الباسورد غلط ❌",
  };

  const go = async () => {
    setErr(""); setBusy(true);
    try {
      if (tab === "signup") {
        if (!name.trim()) { setErr("اكتب اسمك ❌"); setBusy(false); return; }
        const c = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        await updateProfile(c.user, { displayName: name.trim() });
        await set(ref(db, `users/${c.user.uid}`), { xp:0, streak:0, results:[], name:name.trim(), role:"student", lessonProgress:{} });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), pass);
      }
    } catch(e) { setErr(MSGS[e.code]||"حصل خطأ، حاول تاني"); }
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-owl">🦉</div>
        <div className="auth-title">EduGrade5</div>
        <div className="auth-sub">منصة الصف الخامس الابتدائي 📚</div>
        <div className="auth-tabs">
          <button className={`atab ${tab==="login"?"on":""}`}  onClick={() => { setTab("login"); setErr(""); }}>دخول</button>
          <button className={`atab ${tab==="signup"?"on":""}`} onClick={() => { setTab("signup"); setErr(""); }}>حساب جديد</button>
        </div>
        {tab==="signup" && (
          <div className="field"><label>الاسم بالكامل</label>
            <input placeholder="أحمد محمد" value={name} onChange={e=>setName(e.target.value)} dir="rtl" /></div>
        )}
        <div className="field"><label>البريد الإلكتروني</label>
          <input type="email" placeholder="example@gmail.com" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div className="field"><label>كلمة المرور</label>
          <input type="password" placeholder="••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} /></div>
        <button className="green-btn" onClick={go} disabled={busy}>
          {busy ? "⏳ جاري..." : tab==="login" ? "🚀 دخول" : "✨ إنشاء حساب"}
        </button>
        {err && <div className="err-msg">{err}</div>}
      </div>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────────
function HomePage({ userData, onSubject }) {
  const days = ["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];
  const today = new Date().getDay();
  const totalLessons = Object.values(CURRICULUM).reduce((a,s) => a + s.units.reduce((b,u) => b + u.lessons.length, 0), 0);
  const doneLessons  = Object.keys(userData.lessonProgress||{}).length;
  const pct = Math.round((doneLessons/totalLessons)*100);

  return (
    <div className="home">
      <div className="banner">
        <div>
          <h2>أهلاً {userData.name||"يا بطل"} 👋</h2>
          <p>استمر في التعلم واكسب المزيد من النقاط! ⚡</p>
          <div className="progress-bar-wrap" style={{marginTop:10}}>
            <div className="pb-label"><span>تقدمك الكلي</span><span>{doneLessons}/{totalLessons} درس</span></div>
            <div className="pb-track" style={{background:"rgba(255,255,255,.3)"}}>
              <div className="pb-fill" style={{width:`${pct}%`,background:"#fff"}} />
            </div>
          </div>
        </div>
        <div className="owl-big">🦉</div>
      </div>
      <div className="sec-title">📚 المواد الدراسية</div>
      <div className="subj-grid">
        {SUBJECTS.map((s,i) => {
          const subCurr = CURRICULUM[s.id];
          const total = subCurr.units.reduce((a,u) => a + u.lessons.length, 0);
          const done  = Object.keys(userData.lessonProgress||{}).filter(k => k.startsWith(s.id+"_")).length;
          return (
            <div key={s.id} className="subj-card" style={{"--c":s.color,"--sbg":s.bg,animationDelay:`${i*80}ms`}} onClick={() => onSubject(s)}>
              <span className="s-emoji">{s.emoji}</span>
              <div className="s-name">{s.label}</div>
              <div className="s-meta">{total} درس • {subCurr.units.length} وحدات</div>
              <div className="progress-bar-wrap" style={{marginTop:8}}>
                <div className="pb-track"><div className="pb-fill" style={{width:`${Math.round((done/total)*100)}%`,background:s.color}} /></div>
              </div>
              <div className="s-xp">+{s.xp} XP</div>
            </div>
          );
        })}
      </div>
      <div className="streak-box">
        <div className="sec-title" style={{margin:0}}>🔥 الحضور الأسبوعي</div>
        <div className="streak-days">
          {days.map((d,i) => (
            <div key={d} className={`sday ${i<=today?"done":""}`}>
              <span>{i<=today?"✅":"⬜"}</span>
              {d.slice(0,3)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Subject Page ───────────────────────────────────────────────────────────────
function SubjectPage({ subject, userData, onBack, onLesson, onUnitQuiz }) {
  const [openUnits, setOpenUnits] = useState({ 0: true });
  const subCurr = CURRICULUM[subject.id];
  const lp = userData.lessonProgress || {};

  return (
    <div className="subj-page">
      <button className="back-btn" onClick={onBack}>← رجوع</button>
      <div className="subj-hdr">
        <div className="subj-icon" style={{background:subject.bg}}>{subject.emoji}</div>
        <div>
          <div className="subj-hdr-title" style={{color:subject.color}}>{subject.label}</div>
          <div className="subj-hdr-sub">الصف الخامس • {subCurr.units.length} وحدات • {subCurr.units.reduce((a,u)=>a+u.lessons.length,0)} دروس</div>
        </div>
      </div>
      <div className="sec-title">📖 الوحدات والدروس</div>
      <div className="units-list">
        {subCurr.units.map((unit, ui) => {
          const isOpen = openUnits[ui];
          const doneCt = unit.lessons.filter(l => lp[`${subject.id}_${unit.id}_${l.id}`]).length;
          return (
            <div key={unit.id} className="unit-block" style={{animationDelay:`${ui*80}ms`}}>
              <div className="unit-hdr" onClick={() => setOpenUnits(p => ({...p, [ui]: !p[ui]}))}>
                <div>
                  <div className="unit-title">📦 {unit.title}</div>
                  <div className="unit-meta">{unit.lessons.length} دروس • {doneCt}/{unit.lessons.length} مكتمل</div>
                  <div className="pb-track" style={{marginTop:6,height:6,width:180}}>
                    <div className="pb-fill" style={{width:`${Math.round((doneCt/unit.lessons.length)*100)}%`,background:subject.color}} />
                  </div>
                </div>
                <span className={`unit-arrow ${isOpen?"open":""}`}>›</span>
              </div>
              {isOpen && (
                <div className="unit-lessons">
                  {unit.lessons.map((lesson, li) => {
                    const done = lp[`${subject.id}_${unit.id}_${lesson.id}`];
                    return (
                      <div key={lesson.id} className="lesson-row" onClick={() => onLesson(unit, lesson)}>
                        <div className="l-num" style={{background:subject.bg,color:subject.color}}>{li+1}</div>
                        <div>
                          <div className="l-name">{lesson.title}</div>
                          <div className="l-sub">📄 شرح + {lesson.questions.length} أسئلة</div>
                        </div>
                        <span className="l-badge">{done ? "✅" : "▶️"}</span>
                      </div>
                    );
                  })}
                  <button className="unit-quiz-btn" style={{background:subject.color}} onClick={() => onUnitQuiz(unit)}>
                    🧠 اختبار الوحدة: {unit.title}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Lesson Page ────────────────────────────────────────────────────────────────
function LessonPage({ lesson, unit, subject, userData, onBack, onQuizDone }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const lp = userData.lessonProgress || {};
  const alreadyDone = lp[`${subject.id}_${unit.id}_${lesson.id}`];
  const letters = ["أ","ب","ج","د"];

  const pick = (qi, opt) => {
    if (submitted) return;
    setAnswers(p => ({...p, [qi]: opt}));
  };

  const submit = () => {
    if (Object.keys(answers).length < lesson.questions.length) return;
    let s = 0;
    lesson.questions.forEach((q, i) => { if (answers[i] === q.answer) { s++; playBeep("correct"); } else playBeep("wrong"); });
    setScore(s);
    setSubmitted(true);
    if (s === lesson.questions.length) { setTimeout(() => playBeep("success"), 300); }
    onQuizDone(s, lesson.questions.length);
  };

  const stars = submitted ? (score === lesson.questions.length ? 3 : score >= lesson.questions.length * 0.6 ? 2 : 1) : 0;

  return (
    <div className="lesson-page">
      <button className="back-btn" onClick={onBack}>← رجوع للوحدة</button>
      <div className="lesson-card">
        <div className="lesson-title">{subject.emoji} {lesson.title}</div>
        {lesson.video ? (
          <div className="video-wrap">
            <iframe src={lesson.video} title={lesson.title} allowFullScreen />
          </div>
        ) : (
          <div className="no-video">🎥 فيديو قريباً</div>
        )}
        <div className="lesson-content">{lesson.content}</div>
      </div>

      {lesson.questions.length > 0 && (
        <div className="lesson-quiz-section">
          <div className="lq-title">❓ أسئلة الدرس</div>
          {lesson.questions.map((q, qi) => (
            <div key={qi} className="lq-item">
              <div className="lq-q">{qi+1}. {q.q}</div>
              <div className="lq-opts">
                {q.options.map((opt, oi) => {
                  let cls = "lq-opt";
                  if (submitted) {
                    cls += " locked";
                    if (opt === q.answer) cls += " correct";
                    else if (opt === answers[qi]) cls += " wrong";
                  } else if (answers[qi] === opt) {
                    cls += " correct";
                  }
                  return (
                    <button key={opt} className={cls} onClick={() => pick(qi, opt)}>
                      <span className="lq-dot">{letters[oi]}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!submitted && (
            <button className="green-btn" style={{marginTop:10}} onClick={submit} disabled={Object.keys(answers).length < lesson.questions.length}>
              ✅ تسليم الإجابات
            </button>
          )}
          {submitted && (
            <div className="lesson-score">
              <div className="ls-title">
                {stars===3?"🎉 ممتاز!":stars===2?"👍 كويس!":"💪 حاول تاني!"}
              </div>
              <div className="ls-score">{score}/{lesson.questions.length}</div>
              <div className="stars">{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
              <div className="ls-xp">⚡ كسبت {Math.round((score/lesson.questions.length)*subject.xp)} XP</div>
              <div className="ls-btns">
                <button className="btn-sm btn-sm-o" onClick={onBack}>← رجوع</button>
                <button className="btn-sm btn-sm-g" onClick={() => { setAnswers({}); setSubmitted(false); setScore(0); }}>🔁 مرة تانية</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Unit Quiz ──────────────────────────────────────────────────────────────────
function QuizPage({ subject, unit, onBack, onDone }) {
  const allQs = unit.lessons.flatMap(l => l.questions.map(q => ({...q, question: q.q})));
  const qs = allQs.slice(0, Math.min(10, allQs.length));
  const [idx,   setIdx]   = useState(0);
  const [score, setScore] = useState(0);
  const [sel,   setSel]   = useState(null);
  const [lives, setLives] = useState(3);
  const letters = ["أ","ب","ج","د"];
  const cur = qs[idx];
  const pct = (idx/qs.length)*100;

  const pick = (opt) => {
    if (sel !== null) return;
    setSel(opt);
    if (opt === cur.answer) { setScore(s=>s+1); playBeep("correct"); }
    else { setLives(l=>l-1); playBeep("wrong"); }
  };

  const next = () => {
    if (idx+1 < qs.length && lives>0) { setIdx(i=>i+1); setSel(null); }
    else {
      const final = score + (sel===cur.answer?1:0);
      playBeep("success");
      onDone(Math.min(final, qs.length), qs.length);
    }
  };

  if (qs.length === 0) return (
    <div className="quiz-page">
      <button className="back-btn" onClick={onBack}>← رجوع</button>
      <div className="empty"><div>📭</div>لا يوجد أسئلة في هذه الوحدة</div>
    </div>
  );

  return (
    <div className="quiz-page">
      <div className="quiz-top">
        <button className="back-btn" style={{margin:0,padding:"7px 12px"}} onClick={onBack}>✕</button>
        <div className="prog-track">
          <div className="prog-fill" style={{width:`${pct}%`,background:subject.color}} />
        </div>
        <div className="lives">
          {[0,1,2].map(i => <span key={i} className={`heart ${i>=lives?"lost":""}`}>❤️</span>)}
        </div>
      </div>
      <div style={{background:subject.bg,borderRadius:12,padding:"6px 14px",display:"inline-block",marginBottom:10,fontSize:13,fontWeight:800,color:subject.color}}>📦 {unit.title}</div>
      <div className="q-label">سؤال {idx+1} من {qs.length}</div>
      <div className="q-text">{cur.question || cur.q}</div>
      <div className="opts">
        {cur.options.map((opt,i) => {
          let cls="opt";
          if(sel!==null){ cls+=" locked"; if(opt===cur.answer) cls+=" correct"; else if(opt===sel) cls+=" wrong"; }
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)}>
              <span className="opt-l">{letters[i]}</span>{opt}
            </button>
          );
        })}
      </div>
      {sel!==null && (
        <div className={`feedback ${sel===cur.answer?"good":"bad"}`}>
          <div className="fb-msg">{sel===cur.answer ? "🎉 ممتاز! إجابة صحيحة" : `✗ الصواب: ${cur.answer}`}</div>
          <button className="fb-next" onClick={next}>{idx+1<qs.length&&lives>0?"التالي ←":"النتيجة 🏁"}</button>
        </div>
      )}
    </div>
  );
}

// ── Results ────────────────────────────────────────────────────────────────────
function ResultsPage({ result, subject, onHome, onRetry }) {
  const { score, total, xp } = result;
  const pct = Math.round((score/total)*100);
  let color="#f44336", trophy="😔", title="تحتاج مراجعة", msg="لا تستسلم، حاول تاني! 💪";
  if(pct>=80){color="#4caf50";trophy="🏆";title="ممتاز!";msg="نتيجة رائعة، برافو عليك! 🎉"}
  else if(pct>=60){color="#ff9600";trophy="👍";title="كويس!";msg="شغل كويس، بس فيه مجال للتحسين 📈"}
  const stars = pct>=80?3:pct>=60?2:1;
  useEffect(() => { if(pct>=80) playBeep("success"); },[]);

  return (
    <div className="res-page">
      <div className="res-card">
        <div className="res-trophy">{trophy}</div>
        <div className="res-title" style={{color}}>{title}</div>
        <div className="res-sub">{subject.emoji} {subject.label} • {msg}</div>
        <div className="score-ring" style={{color,borderColor:color}}>
          <span className="sn">{score}/{total}</span>
          <span className="sl">{pct}%</span>
        </div>
        <div style={{fontSize:26,margin:"8px 0"}}>{"⭐".repeat(stars)}{"☆".repeat(3-stars)}</div>
        <div className="xp-tag">⚡ كسبت {xp} نقطة XP!</div>
        <div className="res-btns">
          <button className="btn-out" onClick={onHome}>🏠 الرئيسية</button>
          <button className="btn-fill" onClick={onRetry}>🔁 حاول تاني</button>
        </div>
      </div>
    </div>
  );
}

// ── Admin Page ─────────────────────────────────────────────────────────────────
function AdminPage({ onBack }) {
  const [tab,    setTab]    = useState("stats");
  const [users,  setUsers]  = useState([]);
  const [success,setSuccess]= useState("");

  // Add lesson form state
  const [newLesson, setNewLesson] = useState({ subject:"arabic", unit:"u1", title:"", content:"", video:"", questions:[] });
  const [newQ, setNewQ] = useState({ q:"", options:["","",""], answer:"" });

  useEffect(() => {
    onValue(ref(db,"users"), snap => {
      if(snap.exists()) setUsers(Object.entries(snap.val()).map(([uid,v])=>({uid,...v})));
      else setUsers([]);
    });
  }, []);

  const allRes = users.flatMap(u => (u.results||[]).map(r=>({...r,sName:u.name||"؟"}))).sort((a,b)=>b.ts-a.ts);
  const totalXP = users.reduce((a,u)=>a+(u.xp||0),0);
  const avg = allRes.length ? Math.round(allRes.reduce((a,r)=>a+(r.score/r.total)*100,0)/allRes.length) : 0;
  const badge = (s,t) => { const p=(s/t)*100; if(p>=80) return <span className="badge bg">ممتاز</span>; if(p>=60) return <span className="badge by">كويس</span>; return <span className="badge br">ضعيف</span>; };

  const subjectUnits = (sid) => CURRICULUM[sid]?.units.map(u=>({value:u.id,label:u.title})) || [];

  const addQuestion = () => {
    if(!newQ.q.trim() || !newQ.answer.trim()) return;
    setNewLesson(p => ({...p, questions:[...p.questions, {...newQ}]}));
    setNewQ({ q:"", options:["","",""], answer:"" });
  };

  const removeQ = (i) => setNewLesson(p => ({...p, questions: p.questions.filter((_,idx)=>idx!==i)}));

  const saveLesson = async () => {
    if(!newLesson.title.trim() || !newLesson.content.trim()) return;
    const path = `customLessons/${newLesson.subject}/${newLesson.unit}`;
    await push(ref(db, path), { title:newLesson.title, content:newLesson.content, video:newLesson.video, questions:newLesson.questions });
    setSuccess("✅ تم حفظ الدرس بنجاح!");
    setNewLesson(p => ({...p, title:"", content:"", video:"", questions:[]}));
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="admin-page">
      <button className="back-btn" onClick={onBack}>← رجوع</button>
      <div className="sec-title">🛠️ لوحة التحكم</div>
      <div className="admin-tabs">
        {[["stats","📊 إحصائيات"],["results","📋 النتائج"],["students","👥 الطلاب"],["addlesson","➕ إضافة درس"]].map(([k,l])=>(
          <button key={k} className={`a-tab ${tab===k?"on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==="stats" && (
        <>
          <div className="stats-row">
            {[[users.length,"إجمالي الطلاب","#1cb0f6"],[allRes.length,"اختبارات أُجريت","#4caf50"],[`${avg}%`,"متوسط الدرجات","#ff9600"],[totalXP,"إجمالي XP","#ffd900"]].map(([n,l,c],i)=>(
              <div className="stat-box" key={i} style={{animationDelay:`${i*80}ms`}}>
                <div className="stat-n" style={{color:c}}>{n}</div>
                <div className="stat-l">{l}</div>
              </div>
            ))}
          </div>
          <div className="admin-form">
            <div className="af-title">📚 محتوى المنهج</div>
            {Object.entries(CURRICULUM).map(([sid, sdata]) => (
              <div key={sid} style={{marginBottom:14,padding:12,background:"#fafafa",borderRadius:12,border:"1px solid #e0e0e0"}}>
                <b style={{color:sdata.color}}>{sdata.emoji} {sdata.label}</b>
                <div style={{fontSize:12,color:"#9e9e9e",marginTop:4}}>
                  {sdata.units.map(u => `${u.title} (${u.lessons.length} دروس)`).join(" • ")}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="results" && (
        allRes.length===0
          ? <div className="empty"><div>📭</div>لا يوجد نتائج بعد</div>
          : <div className="tbl-wrap"><table>
              <thead><tr><th>الطالب</th><th>المادة/الوحدة</th><th>الدرجة</th><th>XP</th><th>التاريخ</th><th>التقييم</th></tr></thead>
              <tbody>{allRes.map((r,i)=>(
                <tr key={i}><td><b>{r.sName}</b></td><td>{r.label||r.subject}</td><td>{r.score}/{r.total}</td><td>⚡{r.xp}</td><td>{r.date}</td><td>{badge(r.score,r.total)}</td></tr>
              ))}</tbody>
            </table></div>
      )}

      {tab==="students" && (
        users.length===0
          ? <div className="empty"><div>👥</div>لا يوجد طلاب بعد</div>
          : <div className="tbl-wrap"><table>
              <thead><tr><th>الاسم</th><th>الدور</th><th>XP</th><th>اختبارات</th><th>دروس مكتملة</th></tr></thead>
              <tbody>{users.map(u=>(
                <tr key={u.uid}>
                  <td><b>{u.name||"—"}</b></td>
                  <td><span className={`badge ${u.role==="admin"?"by":"bg"}`}>{u.role==="admin"?"أدمن":"طالب"}</span></td>
                  <td>⚡{u.xp||0}</td>
                  <td>{(u.results||[]).length}</td>
                  <td>{Object.keys(u.lessonProgress||{}).length}</td>
                </tr>
              ))}</tbody>
            </table></div>
      )}

      {tab==="addlesson" && (
        <div className="admin-form">
          <div className="af-title">➕ إضافة درس جديد</div>
          <div className="af-row">
            <div className="af-field">
              <label>المادة</label>
              <select value={newLesson.subject} onChange={e => setNewLesson(p=>({...p, subject:e.target.value, unit:"u1"}))}>
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
              </select>
            </div>
            <div className="af-field">
              <label>الوحدة</label>
              <select value={newLesson.unit} onChange={e => setNewLesson(p=>({...p, unit:e.target.value}))}>
                {subjectUnits(newLesson.subject).map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="af-row">
            <div className="af-field">
              <label>عنوان الدرس</label>
              <input placeholder="عنوان الدرس..." value={newLesson.title} onChange={e=>setNewLesson(p=>({...p,title:e.target.value}))} dir="rtl" />
            </div>
          </div>
          <div className="af-row">
            <div className="af-field">
              <label>محتوى الدرس</label>
              <textarea placeholder="اكتب شرح الدرس هنا..." value={newLesson.content} onChange={e=>setNewLesson(p=>({...p,content:e.target.value}))} dir="rtl" style={{minHeight:120}} />
            </div>
          </div>
          <div className="af-row">
            <div className="af-field">
              <label>رابط الفيديو (YouTube embed - اختياري)</label>
              <input placeholder="https://www.youtube.com/embed/..." value={newLesson.video} onChange={e=>setNewLesson(p=>({...p,video:e.target.value}))} dir="ltr" />
            </div>
          </div>

          <div style={{fontWeight:800,marginBottom:10,marginTop:6}}>❓ أسئلة الدرس ({newLesson.questions.length})</div>
          {newLesson.questions.map((q,i) => (
            <div key={i} className="q-item-admin">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <b style={{fontSize:13}}>س{i+1}: {q.q}</b>
                <button className="del-btn" onClick={()=>removeQ(i)}>حذف</button>
              </div>
              <div style={{fontSize:12,color:"#9e9e9e"}}>{q.options.join(" • ")} ← ✅ {q.answer}</div>
            </div>
          ))}

          <div style={{background:"#f5f5f5",borderRadius:12,padding:14,marginTop:6}}>
            <div style={{fontWeight:800,fontSize:13,marginBottom:10,color:"#616161"}}>➕ إضافة سؤال جديد</div>
            <div className="af-field" style={{marginBottom:8}}>
              <label>نص السؤال</label>
              <input placeholder="اكتب السؤال..." value={newQ.q} onChange={e=>setNewQ(p=>({...p,q:e.target.value}))} dir="rtl" />
            </div>
            {[0,1,2].map(i => (
              <div className="af-field" key={i} style={{marginBottom:6}}>
                <label>الاختيار {["أ","ب","ج"][i]}</label>
                <input placeholder={`الاختيار ${["أ","ب","ج"][i]}...`} value={newQ.options[i]} onChange={e=>{const o=[...newQ.options];o[i]=e.target.value;setNewQ(p=>({...p,options:o}))}} dir="rtl" />
              </div>
            ))}
            <div className="af-field" style={{marginBottom:8}}>
              <label>الإجابة الصحيحة (اكتب الاختيار الصح بالضبط)</label>
              <input placeholder="الإجابة الصحيحة..." value={newQ.answer} onChange={e=>setNewQ(p=>({...p,answer:e.target.value}))} dir="rtl" />
            </div>
            <button className="af-btn" style={{background:"#9c27b0",boxShadow:"0 3px 0 #7b1fa2"}} onClick={addQuestion}>+ إضافة السؤال للدرس</button>
          </div>

          <button className="af-btn" style={{marginTop:14,width:"100%",padding:14,fontSize:16}} onClick={saveLesson} disabled={!newLesson.title.trim()}>
            💾 حفظ الدرس
          </button>
          {success && <div className="success-msg">{success}</div>}
        </div>
      )}
    </div>
  );
}
