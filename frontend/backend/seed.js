const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const User = require('./models/User')
const Resource = require('./models/Resource')

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected for seeding...')

    // Seed Admin
    const adminEmail = 'admin@mindspace.com'
    const adminExists = await User.findOne({ email: adminEmail })
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10)
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: hashed,
        role: 'admin'
      })
      console.log('Admin user seeded (admin@mindspace.com / admin123)')
    } else {
      console.log('Admin user already exists')
    }

    // Seed Resources
    console.log('Clearing existing resources...')
    await Resource.deleteMany({})
    
    const articles = [
      {
        title: '5 Steps to Manage Academic Stress',
        content: 'Academic stress is a common challenge for students. To manage it effectively:\n1. Prioritize your tasks by creating a daily schedule.\n2. Break large projects into smaller, manageable milestones.\n3. Take short, regular breaks (the Pomodoro technique works wonders).\n4. Stay physically active and eat balanced meals.\n5. Reach out for support when you feel overwhelmed. Remember, it is okay to ask for help.',
        category: 'Stress',
        readTime: 4,
        author: 'Dr. Sarah Jenkins',
        lang: 'en'
      },
      {
        title: 'අධ්‍යයන ආතතිය පාලනයට පියවර 5ක්',
        content: 'අධ්‍යයන ආතතිය යනු සිසුන් මුහුණ දෙන පොදු අභියෝගයකි. එය සාර්ථකව පාලනය කිරීමට:\n1. දිනපතා කාලසටහනක් සාදා ඔබේ වැඩ ප්‍රමුඛත්වය අනුව පෙළගස්වන්න.\n2. විශාල ව්‍යාපෘති කුඩා, කළමනාකරණය කළ හැකි කොටස්වලට කඩා ගන්න.\n3. කෙටි, නිතිපතා විවේක ගන්න (පොමොඩෝරෝ ක්‍රමය මේ සඳහා ඉතා සාර්ථකයි).\n4. ක්‍රියාශීලීව සිටින්න සහ සමබර ආහාර වේලක් ලබාගන්න.\n5. ඔබට දැඩි පීඩනයක් දැනෙන විට අන් අයගේ සහාය පතන්න. මතක තබා ගන්න, උපකාර ඉල්ලීම වරදක් නොවේ.',
        category: 'Stress',
        readTime: 4,
        author: 'Dr. Sarah Jenkins',
        lang: 'si'
      },
      {
        title: 'Understanding and Calming Test Anxiety',
        content: 'Test anxiety can prevent you from performing your best. To calm your mind before a test:\n1. Prepare thoroughly in advance to build confidence.\n2. Practice positive self-talk instead of focusing on worst-case scenarios.\n3. Arrive early at the exam room to avoid rushing.\n4. Practice box breathing: inhale for 4 seconds, hold for 4, exhale for 4, hold for 4.\n5. Stay hydrated and avoid excessive caffeine, which can mimic physical symptoms of anxiety.',
        category: 'Anxiety',
        readTime: 5,
        author: 'MindSpace Clinical Advisory',
        lang: 'en'
      },
      {
        title: 'විභාග කාංසාව තේරුම් ගැනීම සහ එය සන්සුන් කර ගැනීම',
        content: 'විභාග කාංසාව (test anxiety) හේතුවෙන් ඔබේ උපරිම දක්ෂතා දැක්වීමට බාධා ඇතිවිය හැක. විභාගයකට පෙර ඔබේ මනස සන්සුන් කර ගැනීමට:\n1. විශ්වාසය ගොඩනඟා ගැනීම සඳහා කල්තියා හොඳින් සූදානම් වන්න.\n2. අසමත් වේවි යැයි සිතනවා වෙනුවට, ධනාත්මකව තමා සමඟ කතා කිරීමට (positive self-talk) පුරුදු වන්න.\n3. කලබල වීම වැළැක්වීම සඳහා විභාග ශාලාවට වේලාසනින් පැමිණෙන්න.\n4. කොටු හුස්ම ගැනීමේ ව්‍යායාමය (box breathing) කරන්න: තත්පර 4ක් හුස්ම ගන්න, තත්පර 4ක් රඳවන්න, තත්පර 4ක් පිට කරන්න, තත්පර 4ක් රඳවන්න.\n5. ශරීරය සජලීයව තබා ගන්න සහ කාංසාවේ ලක්ෂණ වැඩි කරන අධික කැෆේන් භාවිතයෙන් වළකින්න.',
        category: 'Anxiety',
        readTime: 5,
        author: 'MindSpace Clinical Advisory',
        lang: 'si'
      },
      {
        title: 'How to Sleep Better During Exam Weeks',
        content: 'Sleep is crucial for cognitive function and memory consolidation. Improve your sleep hygiene by:\n1. Setting a consistent bedtime, even during exams.\n2. Turning off screens (phones, laptops) at least 30 minutes before sleeping.\n3. Creating a quiet, dark, and cool sleeping environment.\n4. Avoiding heavy meals and stimulants late in the evening.\n5. Doing a 5-minute progressive muscle relaxation routine to release bodily tension before sleep.',
        category: 'Sleep',
        readTime: 3,
        author: 'Sleep Wellness Center',
        lang: 'en'
      },
      {
        title: 'විභාග සතිවලදී වඩා හොඳින් නිදා ගන්නේ කෙසේද',
        content: 'මතකය තහවුරු වීමට සහ මොළයේ ක්‍රියාකාරීත්වයට නින්ද අත්‍යවශ්‍ය වේ. ඔබේ නින්දේ ගුණාත්මකභාවය වැඩි දියුණු කර ගැනීමට:\n1. විභාග කාලය තුළ වුවද සෑම දිනකම එකම වේලාවකට නින්දට යන්න.\n2. නින්දට යාමට අවම වශයෙන් විනාඩි 30කට පෙර ජංගම දුරකථන, පරිගණක වැනි තිර (screens) ක්‍රියා විරහිත කරන්න.\n3. නිහඬ, අඳුරු සහ සිසිල් නිදන පරිසරයක් නිර්මාණය කර ගන්න.\n4. රාත්‍රී කාලයේදී අධික ආහාර වේල් ලබා ගැනීමෙන් සහ උත්තේජක පාන වර්ගවලින් වළකින්න.\n5. ශරීරයේ පීඩනය මුදා හැරීම සඳහා නින්දට පෙර විනාඩි 5ක මාංශ පේශි ලිහිල් කිරීමේ ව්‍යායාමයක නිරත වන්න.',
        category: 'Sleep',
        readTime: 3,
        author: 'Sleep Wellness Center',
        lang: 'si'
      },
      {
        title: 'Beginners Guide to Mindfulness Meditation',
        content: 'Mindfulness is the practice of being fully present in the moment without judgment. Try this simple exercise:\n1. Find a comfortable, quiet seat.\n2. Close your eyes and bring your attention to your breathing.\n3. Feel the sensation of breath entering and leaving your nostrils.\n4. When your mind wanders (which it will), gently guide your focus back to your breath.\n5. Start with just 2-3 minutes a day and gradually increase the duration.',
        category: 'Mindfulness',
        readTime: 3,
        author: 'Mindfulness Expert Team',
        lang: 'en'
      },
      {
        title: 'මනෝභාවය සන්සුන් කිරීමේ භාවනාව (Mindfulness) පිළිබඳ ආධුනික අත්පොත',
        content: 'Mindfulness (සතිමත්භාවය) යනු කිසිදු විනිශ්චයකින් තොරව වර්තමාන මොහොතේ සම්පූර්ණයෙන්ම ජීවත් වීමයි. මෙම සරල ව්‍යායාමය උත්සාහ කර බලන්න:\n1. පහසු, නිහඬ ආසනයක් සොයා ගන්න.\n2. ඇස් වසා ඔබේ හුස්ම ගැනීම කෙරෙහි අවධානය යොමු කරන්න.\n3. ඔබේ නාස්පුඩු හරහා හුස්ම ඇතුළු වන සහ පිටවන ආකාරය හොඳින් දැනෙන්නට හරින්න.\n4. ඔබේ මනස වෙනත් අතකට යොමු වන විට (එය සාමාන්‍ය දෙයකි), මෘදු ලෙස නැවත ඔබේ අවධානය හුස්ම වෙත යොමු කරන්න.\n5. දිනකට විනාඩි 2-3ක් වැනි කෙටි කාලයකින් ආරම්භ කර ක්‍රමයෙන් කාලය වැඩි කරන්න.',
        category: 'Mindfulness',
        readTime: 3,
        author: 'Mindfulness Expert Team',
        lang: 'si'
      },
      {
        title: 'WHO Guidelines: Doing What Matters in Times of Stress',
        content: 'Living through adversity or daily pressure can cause significant stress. The World Health Organization (WHO) has developed an evidence-based guide based on Acceptance and Commitment Therapy (ACT) to help people cope. Here are 5 core coping skills to manage stress:\n\n1. **Grounding**: When your mind is racing with difficult thoughts, \'ground\' yourself by paying attention to your physical senses. Feel your feet on the floor, take slow deep breaths, notice the environment around you, and name three things you can see and hear.\n\n2. **Unhooking**: Difficult thoughts and feelings can \'hook\' us, dragging us away from our values. Recognize when you are hooked, label the thought (e.g., \'Here is a feeling of tightness\' or \'I am having the thought that I will fail\'), and gently redirect your focus to what you are doing.\n\n3. **Acting on Values**: Even in difficult times, identify the kind of person you want to be. Choose small, simple actions that align with values like kindness, responsibility, or perseverance, and carry them out.\n\n4. **Being Kind**: Stress can make us harsh on ourselves. Practice self-kindness by speaking to yourself gently, recognizing that everyone struggles, and offering help to others where possible.\n\n5. **Making Room**: Instead of fighting or suppressing painful thoughts and emotions, make room for them. Breathe into the feeling, acknowledge it, and allow it to exist without letting it dictate your actions.',
        category: 'Stress',
        readTime: 5,
        author: 'World Health Organization',
        lang: 'en'
      },
      {
        title: 'WHO මාර්ගෝපදේශ: මානසික ආතතිය පවතින අවස්ථාවල වැදගත් දේ කිරීම',
        content: 'දුෂ්කරතා හෝ එදිනෙදා ජීවිතයේ ඇතිවන පීඩනයන් නිසා දැඩි මානසික ආතතියක් ඇතිවිය හැක. ලෝක සෞඛ්‍ය සංවිධානය (WHO) විසින් මිනිසුන්ට මෙවැනි තත්ත්වයන්ට මුහුණ දීම සඳහා පිළිගැනීම් සහ කැපවීම් ප්‍රතිකාර (ACT) මත පදනම් වූ සාක්ෂි සහිත මාර්ගෝපදේශයක් සකස් කර ඇත. මානසික ආතතිය පාලනය කර ගැනීමට උපකාරී වන ප්‍රධාන කුසලතා 5ක් මෙන්න:\n\n1. **භූගත වීම (Grounding)**: ඔබේ මනස කලබලකාරී සිතුවිලිවලින් පිරී ඇති විට, ඔබේ භෞතික ඉන්ද්‍රියයන් කෙරෙහි අවධානය යොමු කරමින් ඔබව වර්තමාන මොහොතට සම්බන්ධ කරන්න. ඔබේ දෙපා පොළොවට තබා ගන්න, සෙමින් ගැඹුරු හුස්මක් ගන්න, අවට පරිසරය නිරීක්ෂණය කරන්න, සහ ඔබට පෙනෙන සහ ඇසෙන දේවල් තුනක් නම් කරන්න.\n\n2. **ගැලවීම (Unhooking)**: දුෂ්කර සිතුවිලි සහ හැඟීම් අපව අපගේ ජීවන වටිනාකම්වලින් ඈත් කර \'කොකු\' කර තබාගත හැක. ඔබ එසේ කොටු වී ඇති බව හඳුනාගෙන, එම සිතුවිල්ල නම් කරන්න (උදා: \'මට දැඩි පීඩනයක් දැනෙනවා\' හෝ \'මම අසමත් වේවි කියා සිතෙනවා\'), ඉන්පසු මෘදු ලෙස ඔබ කරන කාර්යය වෙත අවධානය යොමු කරන්න.\n\n3. **වටිනාකම් මත ක්‍රියා කිරීම (Acting on Values)**: දුෂ්කර කාලවලදී පවා, ඔබ කෙබඳු පුද්ගලයෙකු වීමට කැමතිදැයි හඳුනා ගන්න. කරුණාවන්තකම, වගකීම හෝ නොපසුබට උත්සාහය වැනි ඔබේ වටිනාකම්වලට ගැලපෙන සරල ක්‍රියා තෝරාගෙන ඒවා ක්‍රියාවට නංවන්න.\n\n4. **කරුණාවන්ත වීම (Being Kind)**: මානසික ආතතිය නිසා අප අපටම දැඩි විය හැක. ඔබ සැමවිටම මුහුණ දෙන අභියෝග සැමට පොදු බව වටහාගෙන, ඔබටම මෘදු ලෙස කතා කරන්න, සහ හැකි සෑම විටම අන් අයටද උපකාර කරන්න.\n\n5. **ඉඩ ලබා දීම (Making Room)**: වේදනාකාරී සිතුවිලි සහ හැඟීම් සමඟ සටන් කිරීමට හෝ ඒවා යටපත් කිරීමට උත්සාහ නොකර, ඒවාට ඔබේ මනස තුළ ඉඩ දෙන්න. එම හැඟීම දෙසට හුස්ම ගන්න, එය පවතින බව පිළිගන්න, සහ එම හැඟීම්වලට ඔබේ ක්‍රියාවන් පාලනය කිරීමට ඉඩ නොදී ඒවාට පැවතීමට ඉඩ දෙන්න.',
        category: 'Stress',
        readTime: 5,
        author: 'World Health Organization',
        lang: 'si'
      },
      {
        title: 'Mayo Clinic: Relaxation Techniques for Stress Relief',
        content: 'Daily stressors can keep your body\'s fight-or-flight response constantly active. According to the Mayo Clinic, incorporating dedicated relaxation techniques and healthy habits can reset your body\'s alarm system and improve your long-term health.\n\nKey relaxation practices include:\n- **Deep Breathing Exercises**: Slow, controlled inhalation and exhalation (such as inhaling for 5 seconds, holding for 2, and exhaling for 5) activate the parasympathetic nervous system, lowering heart rate and blood pressure.\n- **Progressive Muscle Relaxation**: Focus on slowly tensing and then releasing each muscle group, starting from your toes and working up to your neck, to release physical tension.\n- **Regular Physical Activity**: Exercise releases endorphins (feel-good chemicals) and helps clear your mind. Aim for 30 minutes of moderate activity, like walking, swimming, or yoga, most days of the week.\n- **Prioritizing Sleep & Nutrition**: Ensure you get 7 to 9 hours of quality sleep and eat a diet rich in fruits, vegetables, and whole grains to support your body\'s resilience.\n- **Healthy Coping**: Avoid excessive caffeine, alcohol, or nicotine, as they can amplify physical symptoms of stress and disrupt sleep patterns.',
        category: 'Stress',
        readTime: 4,
        author: 'Mayo Clinic',
        lang: 'en'
      },
      {
        title: 'Mayo Clinic: මානසික ආතතිය අඩු කරගැනීමේ ලිහිල් කිරීමේ ක්‍රම',
        content: 'එදිනෙදා ඇතිවන මානසික ආතතිය හේතුවෙන් ඔබේ ශරීරයේ \'සටන් කිරීම හෝ පලායාම\' (fight-or-flight) ප්‍රතිචාරය නිරන්තරයෙන් ක්‍රියාකාරී විය හැක. මේයෝ සායනයට (Mayo Clinic) අනුව, ලිහිල් කිරීමේ ක්‍රමවේද සහ සෞඛ්‍ය සම්පන්න පුරුදු එදිනෙදා ජීවිතයට එකතු කරගැනීමෙන් ඔබේ ශරීරයේ ආතති පද්ධතිය යථා තත්ත්වයට පත් කරගත හැක.\n\nප්‍රධාන ලිහිල් කිරීමේ පුරුදු කිහිපයක් මෙන්න:\n- **ගැඹුරු හුස්ම ගැනීමේ ව්‍යායාම**: සෙමින් සහ පාලනයකින් යුතුව හුස්ම ගැනීම සහ පිට කිරීම (තත්පර 5ක් හුස්ම ඉහළට ගැනීම, තත්පර 2ක් රඳවා ගැනීම, සහ තත්පර 5ක් හුස්ම පිට කිරීම) මගින් හෘද ස්පන්දන වේගය සහ රුධිර පීඩනය අඩු කරගත හැක.\n- **ක්‍රමානුකූල මාංශ පේශි ලිහිල් කිරීම (PMR)**: ඔබේ දෙපතුලෙන් පටන්ගෙන බෙල්ල දක්වා එක් එක් මාංශ පේශි කාණ්ඩය සෙමින් තද කර පසුව ලිහිල් කරන්න. මෙයින් ශරීරයේ ඇති පීඩනය මුදා හැරේ.\n- **නිතිපතා ශාරීරික ක්‍රියාකාරකම්**: ව්‍යායාම මගින් එන්ඩොෆින් (සතුට දනවන රසායනික ද්‍රව්‍ය) ශරීරයෙන් නිදහස් කරන අතර මනස පැහැදිලි කරයි. ඇවිදීම, පිහිනීම හෝ යෝගා වැනි ව්‍යායාමවල දිනකට විනාඩි 30ක් පමණ නිරත වන්න.\n- **නින්ද සහ පෝෂණය**: දිනකට පැය 7 සිට 9 දක්වා ගුණාත්මක නින්දක් ලබාගන්නා අතර, එළවළු, පළතුරු සහ ධාන්‍ය වර්ග බහුල ආහාර වේලක් ලබාගැනීමට හුරු වන්න.\n- **සෞඛ්‍ය සම්පන්නව මුහුණ දීම**: අධික ලෙස කැෆේන්, මධ්‍යසාර හෝ දුම්කොළ භාවිතයෙන් වළකින්න. මන්ද ඒවායින් මානසික ආතතිය සහ නින්ද නොයාම තවත් වැඩි විය හැක.',
        category: 'Stress',
        readTime: 4,
        author: 'Mayo Clinic',
        lang: 'si'
      },
      {
        title: 'APA Science-Based Strategies to Manage Daily Stress',
        content: 'Stress is a natural response to challenging situations, but chronic stress can take a heavy toll on your body and mind. The American Psychological Association (APA) recommends several evidence-based cognitive and behavioral strategies to build resilience:\n\n1. **Track and Understand Your Stressors**: Keep a daily journal for a week or two. Document what situations cause stress, how you react physically and emotionally, and how you cope (e.g., withdraw, overeat, or exercise). This helps you identify patterns.\n2. **Establish Strong Social Support**: Connecting with trusted friends, family, or counselors provides healthy perspective and emotional relief. Don\'t hesitate to share your feelings.\n3. **Reframe Negative Thinking**: Our thoughts directly influence our emotions. Challenge negative self-talk (like \'I can\'t handle this\') and focus on aspects of the situation that you can control, while accepting what you cannot change.\n4. **Practice the 4-4-6 Breathing Rule**: For immediate relief, breathe in for 4 seconds, hold for 4, and exhale slowly for 6 seconds. Repeat this 10 times to calm your nervous system.\n5. **Seek Professional Guidance**: If stress becomes overwhelming or self-care strategies aren\'t enough, consult a licensed psychologist to help you develop a personalized coping plan.',
        category: 'Stress',
        readTime: 5,
        author: 'American Psychological Association',
        lang: 'en'
      },
      {
        title: 'APA: එදිනෙදා මානසික ආතතිය පාලනයට විද්‍යාත්මක ක්‍රමවේද',
        content: 'මානසික ආතතිය යනු අභියෝගාත්මක අවස්ථාවලදී ඇතිවන ස්වභාවික ප්‍රතිචාරයකි, නමුත් දිගුකාලීන ආතතිය ඔබේ ශරීරයට සහ මනසට අහිතකර ලෙස බලපායි. ඇමරිකානු මනෝවිද්‍යා සංගමය (APA) විසින් නිර්දේශ කරන ලද සාක්ෂි සහිත ක්‍රම කිහිපයක් මෙන්න:\n\n1. **ඔබේ ආතතිය ඇතිවන අවස්ථා හඳුනා ගන්න**: සති එකක් හෝ දෙකක් දිනපොතක් තබා ගන්න. ආතතිය ඇති කරන තත්ත්වයන්, ඔබේ කායික හා මානසික ප්‍රතිචාර සහ ඔබ ඊට මුහුණ දුන් ආකාරය සටහන් කරන්න.\n2. **ශක්තිමත් සමාජ සබඳතා ගොඩනඟා ගන්න**: විශ්වාසවන්ත මිතුරන්, පවුලේ අය හෝ උපදේශකයන් සමඟ සම්බන්ධ වීමෙන් මානසික සහනයක් සහ සහයෝගයක් ලැබේ. ඔබේ හැඟීම් බෙදා ගැනීමට පසුබට නොවන්න.\n3. **සෘණාත්මක සිතුවිලි වෙනස් කරන්න**: අපගේ සිතුවිලි කෙලින්ම අපගේ හැඟීම් කෙරෙහි බලපායි. \'මට මේක කරන්න බැහැ\' වැනි සෘණාත්මක සිතුවිලි අභියෝගයට ලක් කර, ඔබට පාලනය කළ හැකි දේ කෙරෙහි අවධානය යොමු කරන්න.\n4. **4-4-6 හුස්ම ගැනීමේ රීතිය**: ක්ෂණික සහනයක් සඳහා තත්පර 4ක් හුස්ම ගන්න, තත්පර 4ක් රඳවා ගන්න, ඉන්පසු තත්පර 6ක් පුරා සෙමින් හුස්ම පිට කරන්න. මෙය 10 වතාවක් නැවත කරන්න.\n5. **වෘත්තීය සහය ලබා ගන්න**: මානසික ආතතිය පාලනය කළ නොහැකි මට්ටමක පවතී නම්, සුදුසුකම් ලත් මනෝවිද්‍යාඥයෙකු හෝ උපදේශකයෙකු හමුවී උපදෙස් ලබා ගන්න.',
        category: 'Stress',
        readTime: 5,
        author: 'American Psychological Association',
        lang: 'si'
      },
      {
        title: 'NHS Every Mind Matters: Tips for Better Mental Wellbeing',
        content: 'The National Health Service (NHS) Every Mind Matters program emphasizes that taking small steps can have a huge impact on your mental wellbeing and stress levels. Here are practical ways to take control of your stress:\n\n- **Create a Mind Plan**: Answer a few simple questions on the NHS site to generate a personalized action plan with tailored tips for sleep, mood, and anxiety.\n- **Establish a Consistent Routine**: Having structured routines for eating, sleeping, and exercising provides a comforting sense of predictability and control during turbulent times.\n- **Spend Time in Nature**: Taking a walk in a park, garden, or local green space can significantly reduce stress hormone levels and improve your mood.\n- **Connect with Others**: Isolation worsens stress. Plan regular check-ins with friends, class peers, or family members to talk or simply relax together.\n- **Look After Your Physical Health**: Small physical steps, like reducing screen time before bed, limiting caffeine, and drinking enough water, can dramatically lower anxiety symptoms.',
        category: 'Stress',
        readTime: 3,
        author: 'NHS Every Mind Matters',
        lang: 'en'
      },
      {
        title: 'NHS Every Mind Matters: යහපත් මානසික සෞඛ්‍යයක් සඳහා උපදෙස්',
        content: 'එක්සත් රාජධානියේ ජාතික සෞඛ්‍ය සේවයේ (NHS) Every Mind Matters වැඩසටහන පෙන්වා දෙන්නේ කුඩා පියවරයන් මගින් ඔබේ මානසික සෞඛ්‍යයට විශාල බලපෑමක් කළ හැකි බවයි. මානසික ආතතිය අඩු කර ගැනීමට කළ හැකි ප්‍රායෝගික දේ මෙන්න:\n\n- **ක්‍රමවත් දින චරියාවක් පවත්වා ගන්න**: ආහාර ගැනීම, නින්ද සහ ව්‍යායාම සඳහා ස්ථාවර දින චරියාවක් තිබීම අසීරු කාලවලදී පාලනයක් සහ ස්ථාවරත්වයක් ලබා දෙයි.\n- **ස්වභාවධර්මය සමඟ කාලය ගත කරන්න**: උද්‍යානයක, වත්තක හෝ හරිත අවකාශයක ඇවිදීමෙන් ආතති හෝමෝන මට්ටම සැලකිය යුතු ලෙස අඩු වන අතර මනෝභාවය යහපත් වේ.\n- **අන් අය සමඟ සම්බන්ධ වන්න**: තනිව හුදකලා වීම මානසික ආතතිය වැඩි කරයි. මිතුරන්, පන්තියේ සගයන් හෝ පවුලේ අය සමඟ නිතර කතාබස් කිරීමට හෝ එකට කාලය ගත කිරීමට සැලසුම් කරන්න.\n- **කායික සෞඛ්‍යය රැකගන්න**: නින්දට පෙර තිර (දුරකථන, පරිගණක) පරිශීලනය අවම කිරීම, කැෆේන් භාවිතය සීමා කිරීම සහ ප්‍රමාණවත් පරිදි ජලය පානය කිරීම වැනි කුඩා පුරුදු මගින් කාංසාව අඩු කරගත හැක.\n- **මනස සන්සුන් කරන ක්‍රියාකාරකම්**: විනෝදාංශයක නිරත වීම, සංගීතයට සවන්දීම වැනි ඔබ ප්‍රිය කරන දේ සඳහා දිනපතා යම් කාලයක් වෙන් කරන්න.',
        category: 'Stress',
        readTime: 3,
        author: 'NHS Every Mind Matters',
        lang: 'si'
      }
    ]
    await Resource.insertMany(articles)
    console.log('Initial resource articles seeded successfully!')

    console.log('Seeding completed!')
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

seed()
