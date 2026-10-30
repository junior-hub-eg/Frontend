// Arabic texts of the "AI Concept Videos" feature (app/teacher/ai-integration/page.tsx).
// Same format as mentors.ts: the key is the English text used in the code, the value is the Arabic.
// {concept}, {subject}, {classes}, {name}, {n}, {xp} are filled in by the page.
export const aiIntegration: Record<string, string> = {
  // Page
  "AI Integration": "الذكاء الاصطناعي",
  "AI Integration & Curriculum": "الذكاء الاصطناعي والمنهج",
  "Turn short AI concept videos into interactive lessons linked directly to your school curriculum.":
    "حوّل فيديوهات مفاهيم الذكاء الاصطناعي القصيرة إلى دروس تفاعلية مرتبطة مباشرة بمنهج مدرستك.",

  // Card
  "AI Concept Videos": "فيديوهات مفاهيم الذكاء الاصطناعي",
  "Turn a short AI concept video into a lesson linked to your subject.": "حوّل فيديو قصير عن مفهوم في الذكاء الاصطناعي إلى درس مرتبط بمادتك.",
  "Use in class": "استخدمه في الفصل",
  "Coming soon": "قريبًا",
  "Finish the previous video first": "أكمل الفيديو السابق أولًا",
  "Play video": "تشغيل الفيديو",
  "Recently linked": "تم ربطها مؤخرًا",
  "Class {name}": "الفصل {name}",
  "{concept} was linked to {subject} and published to {classes}.": "تم ربط {concept} بمادة {subject} ونشره في {classes}.",

  // Subjects
  "Physics": "الفيزياء",
  "Math": "الرياضيات",
  "Biology": "الأحياء",
  "Chemistry": "الكيمياء",

  // Concepts
  "Computer Vision": "الرؤية الحاسوبية",
  "Machine Learning Basics": "أساسيات تعلّم الآلة",
  "Chatbots & Language Models": "الشات بوت ونماذج اللغة",
  "Short video explaining Computer Vision with simple drawings.": "فيديو قصير يشرح الرؤية الحاسوبية برسومات مبسّطة.",
  "Short video explaining Machine Learning basics.": "فيديو قصير يشرح أساسيات تعلّم الآلة.",
  "Short video explaining Chatbots and Language Models.": "فيديو قصير يشرح الشات بوت ونماذج اللغة.",

  // Summary (Computer Vision)
  "What it is": "ما هي",
  "Computer Vision lets computers understand images and video the way people do.": "الرؤية الحاسوبية تجعل الكمبيوتر يفهم الصور والفيديو كما يفهمها الإنسان.",
  "How it works": "كيف تعمل",
  "A camera turns the picture into numbers, and a trained model finds patterns such as edges, shapes and objects.":
    "الكاميرا تحوّل الصورة إلى أرقام، ونموذج مدرَّب يكتشف فيها أنماطًا مثل الحواف والأشكال والأجسام.",
  "Where it's used": "أين تُستخدم",
  "Face unlock, self-driving cars, medical scans and spotting plant diseases from a photo.":
    "فتح الهاتف بالوجه، والسيارات ذاتية القيادة، والأشعة الطبية، واكتشاف أمراض النباتات من صورة.",

  // Summary (other concepts)
  "Overview": "نظرة عامة",
  "Key concepts": "المفاهيم الأساسية",
  "Introduction to machine learning models.": "مقدمة عن نماذج تعلّم الآلة.",
  "Understanding data science fundamentals.": "فهم أساسيات علم البيانات.",
  "Introduction to language models.": "مقدمة عن نماذج اللغة.",
  "Understanding chatbots.": "فهم كيف يعمل الشات بوت.",

  // Link ideas: physics
  "The camera captures light through lenses and reflection, the same thing you study in optics.":
    "الكاميرا تلتقط الضوء بالعدسات والانعكاس، وهو نفس ما تدرسه في البصريات.",
  "Compare how a camera lens focuses light with how the lens of the eye does.": "قارن بين تركيز عدسة الكاميرا للضوء وتركيز عدسة العين له.",
  "Build a simple pinhole camera to see how light forms an image.": "اصنع كاميرا ثقب الإبرة البسيطة لترى كيف يكوّن الضوء الصورة.",

  // Link ideas: math
  "An image is a matrix of numbers (pixels), and AI does its calculations on it.": "الصورة عبارة عن مصفوفة أرقام (بكسلات)، والذكاء الاصطناعي يجري حساباته عليها.",
  "Count how many numbers it takes to describe a small 10×10 image.": "احسب كم رقمًا يلزم لوصف صورة صغيرة بحجم 10×10.",
  "Use coordinates to describe where an object sits inside a picture.": "استخدم الإحداثيات لوصف مكان الجسم داخل الصورة.",

  // Link ideas: biology
  "The eye and the brain recognize shapes, and AI imitates that.": "العين والمخ يتعرفان على الأشكال، والذكاء الاصطناعي يحاكي ذلك.",
  "Compare the cells of the retina with the pixels of a camera sensor.": "قارن بين خلايا الشبكية وبكسلات حسّاس الكاميرا.",
  "Discuss how the brain recognizes a face even in poor light.": "ناقش كيف يتعرف المخ على الوجه حتى في الإضاءة الضعيفة.",

  // Link ideas: chemistry
  "The camera reads the color of a reaction or solution and estimates the concentration.": "الكاميرا تقرأ لون التفاعل أو المحلول وتقدّر التركيز.",
  "Compare the color of solutions at different concentrations using a phone camera.": "قارن لون محاليل بتركيزات مختلفة باستخدام كاميرا الهاتف.",
  "Explain how a color change shows that a reaction has finished.": "اشرح كيف يدل تغيّر اللون على انتهاء التفاعل.",

  // Quick check
  "What does a computer see when it looks at a picture?": "ماذا يرى الكمبيوتر عندما ينظر إلى صورة؟",
  "A grid of numbers (pixels)": "شبكة من الأرقام (بكسلات)",
  "A tiny human eye": "عين إنسان صغيرة",
  "Only the colors red and blue": "اللونين الأحمر والأزرق فقط",
  "Which one is an example of Computer Vision?": "أي مما يلي مثال على الرؤية الحاسوبية؟",
  "Unlocking a phone with your face": "فتح الهاتف بوجهك",
  "Playing a song from a playlist": "تشغيل أغنية من قائمة التشغيل",
  "Sending a text message": "إرسال رسالة نصية",

  // Wizard
  "Use a concept video in class": "استخدم فيديو مفهوم في الفصل",
  "Watch, choose a subject, pick a link, then publish.": "شاهد، واختر المادة، ثم اختر الربط، وبعدها انشر.",
  "Watch & summary": "المشاهدة والملخص",
  "Subject": "المادة",
  "Link idea": "فكرة الربط",
  "Preview & publish": "المعاينة والنشر",
  "Quick summary": "ملخص سريع",
  "Which subject do you teach?": "أي مادة تدرّس؟",
  "The AI will suggest ways to connect {concept} to it.": "سيقترح الذكاء الاصطناعي طرقًا لربط {concept} بها.",
  "AI link ideas": "أفكار الربط من الذكاء الاصطناعي",
  "Pick one idea, or write your own.": "اختر فكرة، أو اكتب فكرتك بنفسك.",
  "Suggest new ideas": "اقتراح أفكار جديدة",
  "The AI is thinking…": "الذكاء الاصطناعي يفكّر…",
  "Write my own link": "أكتب الربط بنفسي",
  "Write how {concept} connects to your subject…": "اكتب كيف يرتبط {concept} بمادتك…",
  "Student view": "ما يراه الطالب",
  "This is what your students will see under the video.": "هذا ما سيراه طلابك تحت الفيديو.",
  "Teacher's link to the subject": "ربط المعلم بالمادة",
  "Pick or write a link in the previous step.": "اختر أو اكتب الربط في الخطوة السابقة.",
  "Quick Check": "اختبار سريع",
  "{n} questions": "{n} سؤال",
  "+{xp} XP": "+{xp} XP",
  "Publish to classes": "النشر في الفصول",
  "No classes yet. Ask the school admin to link your classes.": "لا توجد فصول بعد. اطلب من إدارة المدرسة ربط فصولك.",
  "Choose at least one class.": "اختر فصلًا واحدًا على الأقل.",
  "We couldn't publish. Please try again.": "تعذّر النشر. حاول مرة أخرى.",
  "We couldn't load the concept videos.": "تعذّر تحميل فيديوهات المفاهيم.",
  "Cancel": "إلغاء",
  "Back": "رجوع",
  "Next": "التالي",
  "Publish": "نشر",
};
