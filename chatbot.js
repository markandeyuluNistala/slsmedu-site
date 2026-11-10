/* Client-side knowledge-base assistant. Answers only from published site content. No APIs or keys. */
(function () {
  'use strict';
  if (window.__cbLoaded) return;
  window.__cbLoaded = true;

  var IN_BLOG = /\/blog(\/|$)/.test(location.pathname || '');
  var ROOT = IN_BLOG ? '..' : '.';
  var MAIL = 'Markandeyulu.nistala@gmail.com';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;
  function robotSvg(kind) {
    var id = 'cbg' + (++uid);
    var bid = 'cbb' + uid;
    return '<span class="cb-mascot' + (kind ? ' ' + kind : '') + '" aria-hidden="true">' +
      '<span class="cb-orbit"><i></i><i></i><i></i><i></i><i></i><i></i></span>' +
      '<span class="cb-shadow"></span>' +
      '<span class="cb-bob"><span class="cb-wiggle"><svg viewBox="0 0 80 88">' +
      '<defs>' +
      '<linearGradient id="' + id + '" x1="20%" y1="0%" x2="80%" y2="100%">' +
      '<stop offset="0%" stop-color="#e9fbff"/><stop offset="40%" stop-color="#64d2ff"/>' +
      '<stop offset="78%" stop-color="#5e5ce6"/><stop offset="100%" stop-color="#bf5af2"/></linearGradient>' +
      '<linearGradient id="' + bid + '" x1="30%" y1="0%" x2="70%" y2="100%">' +
      '<stop offset="0%" stop-color="#7ad8ff"/><stop offset="100%" stop-color="#6a5ae6"/></linearGradient>' +
      '</defs>' +
      /* antenna */
      '<rect x="38.2" y="8" width="3.6" height="11" rx="1.8" fill="#9ae4ff"/>' +
      '<circle class="cb-ant-glow" cx="40" cy="8.2" r="6.5" fill="#64d2ff" opacity=".45"/>' +
      '<circle class="cb-ant-bulb" cx="40" cy="8.2" r="4.2" fill="#f4feff" stroke="#b8f0ff" stroke-width="1"/>' +
      /* left arm */
      '<g class="cb-arm-l">' +
      '<rect x="11" y="50" width="10" height="7" rx="3.5" fill="url(#' + bid + ')"/>' +
      '<circle cx="12.5" cy="53.5" r="4.2" fill="#d9f6ff"/>' +
      '</g>' +
      /* right arm (waves) */
      '<g class="cb-arm-r">' +
      '<rect x="59" y="48" width="10" height="7" rx="3.5" fill="url(#' + bid + ')"/>' +
      '<circle cx="71" cy="50" r="4.4" fill="#d9f6ff"/>' +
      '<path d="M69.2 47.2c1.8-3.6 5.2-3.2 5.6-.2" fill="none" stroke="#d9f6ff" stroke-width="1.7" stroke-linecap="round"/>' +
      '</g>' +
      /* body */
      '<rect x="22" y="52" width="36" height="26" rx="11" fill="url(#' + bid + ')" stroke="rgba(255,255,255,.25)" stroke-width=".8"/>' +
      '<circle class="cb-chest" cx="40" cy="64" r="4.4" fill="#f4feff"/>' +
      '<circle class="cb-chest" cx="40" cy="64" r="2.4" fill="#5e5ce6"/>' +
      /* legs */
      '<rect x="26" y="75" width="9" height="8" rx="3" fill="#6a5ae6"/>' +
      '<rect x="45" y="75" width="9" height="8" rx="3" fill="#6a5ae6"/>' +
      /* side bolts */
      '<rect x="16.5" y="34" width="6" height="12" rx="3" fill="#8ee7ff"/>' +
      '<rect x="57.5" y="34" width="6" height="12" rx="3" fill="#8ee7ff"/>' +
      /* head */
      '<rect x="18" y="20" width="44" height="36" rx="14" fill="url(#' + id + ')" stroke="rgba(255,255,255,.35)" stroke-width="1"/>' +
      '<rect x="23" y="28" width="34" height="22" rx="10" fill="rgba(6,10,28,.42)"/>' +
      /* eyes */
      '<g class="cb-eye"><ellipse cx="31.5" cy="38" rx="5.1" ry="5.6" fill="#f5feff"/></g>' +
      '<g class="cb-eye"><ellipse cx="48.5" cy="38" rx="5.1" ry="5.6" fill="#f5feff"/></g>' +
      '<g class="cb-pupils">' +
      '<circle cx="32.1" cy="38.5" r="2.15" fill="#0b1a3a"/>' +
      '<circle cx="49.1" cy="38.5" r="2.15" fill="#0b1a3a"/>' +
      '<circle cx="32.7" cy="37.8" r=".6" fill="#fff"/>' +
      '<circle cx="49.7" cy="37.8" r=".6" fill="#fff"/>' +
      '</g>' +
      /* mouths: idle smile, happy open smile, talking oval, thinking small o */
      '<path class="cb-mouth-idle" d="M34 46.5q6 4.4 12 0" fill="none" stroke="#d9f6ff" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path class="cb-mouth-happy" d="M33 45.2q7 7.4 14 0" fill="#ff7ad9" stroke="#f4feff" stroke-width="1.1" stroke-linecap="round"/>' +
      '<ellipse class="cb-mouth-talk" cx="40" cy="47" rx="5.2" ry="3.3" fill="#2a1540" stroke="#d9f6ff" stroke-width="1"/>' +
      '<circle class="cb-mouth-think" cx="40" cy="46.5" r="2.1" fill="none" stroke="#d9f6ff" stroke-width="1.6"/>' +
      '</svg></span></span></span>';
  }

  var BLE = ROOT + '/blog/ios-ble-corebluetooth.html';
  var WID = ROOT + '/blog/ios-widgetkit-widgets.html';
  var BLOG = ROOT + '/blog/';
  var RESUME = ROOT + '/resume.pdf';
  var TIZ = 'https://apps.apple.com/ag/app/tizola/id1580384001';
  var HOM = 'https://apps.apple.com/in/app/homza-cart/id6469615165';
  var RIDE = 'https://apps.apple.com/in/app/foodride/id6448753702';

  function A(label, href, extra) {
    return '<a href="' + href + '"' + (extra || '') + '>' + label + '</a>';
  }
  var MAIL_A = A(MAIL, 'mailto:' + MAIL);
  var RES_A = A('Download Resume', RESUME, ' download="Markandeyulu_Nistala_Resume.pdf"');

  var ANS = {
    greet: 'Hi — I’m Markandeyulu’s site assistant. I can tell you about his iOS work, skills, apps and blog posts, or help you download his resume and get in touch. What would you like to know?',
    about: 'Markandeyulu Nistala is a results-driven iOS Developer with <strong>4.9 years</strong> of experience building scalable, high-performance mobile apps using Swift, SwiftUI and Combine — in Automotive and Mobility, and on the App Store. He currently works at Innominds Software Pvt. Ltd. in Hyderabad on Royal Enfield’s Flying Flea app.',
    experience: 'He has <strong>4.9 years</strong> of iOS experience across two companies:</p><p><strong>Innominds Software Pvt. Ltd., Hyderabad</strong> — iOS Application Developer, Nov 2024 – Present. He builds scalable features for Royal Enfield’s Flying Flea app with SwiftUI, Combine and MVVM, including BLE for real-time vehicle dashboard updates, push notifications with Firebase Cloud Messaging (FCM) and Salesforce Marketing Cloud (SFMC), a centralized enum-driven alert system, network monitoring with NWPathMonitor and Combine, and Core Data persistence for notification history. He also uses SwiftLint and works in Agile sprints with Jira and Git.</p><p><strong>Colour Moon Technologies Pvt. Ltd., Visakhapatnam</strong> — iOS Application Developer, Oct 2021 – Jun 2024. He developed and maintained production-grade iPhone and iPad apps with Swift (UIKit) and SwiftUI, MVC and MVVM, REST APIs with URLSession and Alamofire, and SDKs including Google Maps, Facebook SDK and payment gateways. He managed the full App Store release lifecycle — certificates, provisioning, TestFlight and compliance.',
    innominds: 'At <strong>Innominds Software Pvt. Ltd.</strong> in Hyderabad (Nov 2024 – Present), Markandeyulu is an iOS Application Developer on Royal Enfield’s <strong>Flying Flea</strong> app. His work includes SwiftUI, Combine and MVVM features, BLE for real-time vehicle dashboard updates, device scanning and connection management, push notifications across foreground, background and terminated states with FCM and SFMC, a centralized alert system, NWPathMonitor, Core Data notification history, SwiftLint, and Agile collaboration with backend, QA and design.',
    colour: 'At <strong>Colour Moon Technologies Pvt. Ltd.</strong> in Visakhapatnam (Oct 2021 – Jun 2024), he was an iOS Application Developer. He built production-grade iPhone and iPad apps with Swift (UIKit) and SwiftUI, used MVC and MVVM, integrated REST APIs with URLSession and Alamofire (Codable models), added Google Maps, Facebook SDK, payment gateways and push notifications, and managed certificates, provisioning, TestFlight and App Store compliance. He also worked on compatibility, performance, debugging and crash analysis.',
    ble: 'He integrates <strong>BLE (Bluetooth Low Energy)</strong> in Royal Enfield’s Flying Flea app at Innominds — for real-time vehicle dashboard updates, device scanning and connection management. You can read his guide, ' + A('How iOS Bluetooth Low Energy (BLE) Works: A CoreBluetooth Guide', BLE) + ' (about 9 min). It covers roles, scanning, GATT, notifications, background modes, state restoration, and a Combine wrapper, drawn from that Flying Flea work.',
    apps: 'Featured project: <strong>Flying Flea</strong> — Royal Enfield Electric Connected Vehicle. Scalable iOS features in SwiftUI, Combine and MVVM, with BLE-driven real-time dashboard updates, push notifications via FCM and SFMC, a centralized alert system, network monitoring and Core Data notification history.</p><p>Three food applications are live on the App Store:</p><ul><li>' + A('Tizola', TIZ, ' target="_blank" rel="noopener"') + '</li><li>' + A('Homza Cart', HOM, ' target="_blank" rel="noopener"') + '</li><li>' + A('Food Ride', RIDE, ' target="_blank" rel="noopener"') + '</li></ul><p>The site notes 3 App Store apps and 2 companies.',
    skills: 'His technical toolkit, as listed on the site:</p><ul><li><strong>Languages:</strong> Swift (the Tech Stack also shows Objective-C)</li><li><strong>Frameworks:</strong> SwiftUI, UIKit, Combine, Core Data, Core Animation</li><li><strong>Architecture:</strong> MVC, MVVM</li><li><strong>Networking:</strong> REST APIs, URLSession, Alamofire</li><li><strong>Push notifications:</strong> Firebase Cloud Messaging (FCM)</li><li><strong>Connectivity:</strong> BLE (Bluetooth Low Energy), NWPathMonitor</li><li><strong>Database:</strong> Core Data, Realm</li><li><strong>Tools &amp; practices:</strong> Xcode, Git, Jira, TestFlight, Agile, CI/CD, App Store deployment</li></ul><p>The tech sphere also includes Swift PM, CocoaPods, CoreBluetooth, Firebase, GitHub, Figma, Core ML, and AI assistants such as Cursor, GitHub Copilot, Claude and Gemini.',
    education: 'His education, as listed on the site (no grades or GPA are published):</p><ul><li><strong>2019</strong> — B.Tech, Mechanical Engineering, Avanthi Institute of Engineering and Technology, Visakhapatnam, Andhra Pradesh</li><li><strong>2015</strong> — Intermediate (MPC), Narayana College, Visakhapatnam, Andhra Pradesh</li><li><strong>2013</strong> — Secondary School Education, Navodaya Model School, Palakonda, Andhra Pradesh</li></ul><p>Languages: English, Telugu.',
    blog: 'Two posts are published here:</p><ul><li>' + A('How iOS Bluetooth Low Energy (BLE) Works: A CoreBluetooth Guide', BLE) + ' — roles, scanning, GATT, notifications, background modes and state restoration, plus a Combine wrapper (9 min, Oct 29, 2026).</li><li>' + A('How iOS Widgets (WidgetKit) Work: Timelines, App Groups and Interactivity', WID) + ' — timelines, reload policies, widget families, App Groups, interactive widgets with App Intents and Lock Screen widgets (8 min, Oct 29, 2026).</li></ul><p>' + A('View all posts', BLOG) + '.',
    resume: 'You can download his resume here: ' + RES_A + '. The file is saved as Markandeyulu_Nistala_Resume.pdf.',
    contact: 'The quickest way to reach him is email: ' + MAIL_A + '. He is open to conversations about iOS development.',
    social: 'Social profile links such as LinkedIn or a GitHub profile URL aren’t listed on this site. The published way to get in touch is email: ' + MAIL_A + '.',
    phone: 'A phone number isn’t listed on this site. The quickest way to reach Markandeyulu is email: ' + MAIL_A + '.',
    ai: 'He brings AI into iOS work in two ways. On-device, he uses Core ML and Apple’s on-device frameworks for fast, private features such as classification, smart suggestions and personalisation. In the workflow, he uses AI coding assistants — Cursor, GitHub Copilot and Claude — to prototype, write tests, review code and explore APIs faster, while keeping architecture and quality decisions human.',
    where: 'His current role is at Innominds Software Pvt. Ltd. in <strong>Hyderabad</strong> (Nov 2024 – Present). He previously worked at Colour Moon Technologies Pvt. Ltd. in <strong>Visakhapatnam</strong> (Oct 2021 – Jun 2024). His studies were also in Andhra Pradesh — Visakhapatnam and Palakonda.',
    thanks: 'You’re welcome. Ask me anything else about his experience, apps, skills, blog posts, or how to get in touch.',
    bye: 'Goodbye — feel free to open this chat again anytime. If you want to reach Markandeyulu, email ' + MAIL_A + '.',
    name: 'His name is <strong>Markandeyulu Nistala</strong>. He’s an iOS Developer with 4.9 years of experience.',
    fallback: 'I’m not sure about that — I only answer from what’s published on this site, and I don’t invent details. You can ask about his experience, skills, apps, blog posts, education, resume, or how to get in touch.'
  };

  /* keyword / synonym / phrase intents. Higher weight = more specific. */
  var INTENTS = [
    { id: 'phone', w: 12, words: ['cellphone', 'telephone', 'whatsapp'], phrases: ['phone number', 'contact number', 'mobile number', 'his number', 'call him', 'call you'] },
    { id: 'social', w: 12, words: ['linkedin', 'instagram', 'facebook'], phrases: ['linked in', 'github profile', 'twitter', 'social profile', 'social media'] },
    { id: 'resume', w: 10, words: ['resume', 'cv', 'curriculum'], phrases: ['download resume', 'download cv'] },
    { id: 'blog', w: 9, words: ['blog', 'article', 'articles', 'post', 'posts', 'widgetkit', 'widgets', 'widget', 'writeup', 'write-up'], phrases: ['blog post', 'your blog'] },
    { id: 'ble', w: 10, words: ['ble', 'bluetooth', 'corebluetooth', 'gatt', 'peripheral'], phrases: ['low energy', 'bluetooth low'] },
    { id: 'apps', w: 9, words: ['app', 'apps', 'application', 'applications', 'project', 'projects', 'tizola', 'homza', 'foodride', 'food', 'portfolio', 'appstore'], phrases: ['homza cart', 'food ride', 'app store', 'selected work'] },
    { id: 'innominds', w: 10, words: ['innominds', 'enfield', 'flea', 'automotive', 'mobility', 'vehicle', 'dashboard'], phrases: ['royal enfield', 'flying flea', 'connected vehicle', 'current job', 'current role', 'where does he work', 'where do you work'] },
    { id: 'colour', w: 10, words: ['colour', 'color', 'moon'], phrases: ['colour moon', 'color moon'] },
    { id: 'education', w: 9, words: ['education', 'degree', 'college', 'university', 'studied', 'study', 'btech', 'b.tech', 'school', 'avanthi', 'narayana', 'navodaya', 'mechanical', 'intermediate', 'gpa', 'grade', 'grades', 'cgpa'], phrases: ['where did he study', 'where he studied'] },
    { id: 'skills', w: 8, words: ['skill', 'skills', 'stack', 'tech', 'technology', 'technologies', 'swift', 'swiftui', 'uikit', 'combine', 'mvvm', 'mvc', 'alamofire', 'firebase', 'xcode', 'toolkit', 'framework', 'frameworks'], phrases: ['tech stack', 'technical toolkit', 'what can he do'] },
    { id: 'ai', w: 8, words: ['ai', 'ml', 'coreml', 'copilot', 'claude', 'gemini', 'cursor', 'intelligence'], phrases: ['core ml', 'machine learning', 'on-device'] },
    { id: 'contact', w: 9, words: ['contact', 'email', 'mail', 'reach', 'hire', 'hiring', 'available', 'availability'], phrases: ['get in touch', 'reach him', 'reach you', 'how to contact'] },
    { id: 'where', w: 8, words: ['where', 'location', 'hyderabad', 'visakhapatnam', 'vizag', 'andhra', 'city', 'based', 'live', 'lives'], phrases: ['where is he', 'which city'] },
    { id: 'experience', w: 7, words: ['experience', 'experienced', 'career', 'years', 'year', 'work', 'worked', 'working', 'job', 'jobs', 'company', 'companies', 'employer', 'role', 'roles', 'background'], phrases: ['how long', 'how many years', 'work history', 'where has he worked'] },
    { id: 'about', w: 6, words: ['about', 'who', 'bio', 'profile', 'intro', 'introduction', 'himself', 'overview'], phrases: ['who is', 'who are you', 'tell me about him', 'tell me about markandeyulu'] },
    { id: 'name', w: 6, words: ['name', 'named', 'called', 'markandeyulu', 'nistala'], phrases: ['full name', 'his name'] },
    { id: 'thanks', w: 5, words: ['thanks', 'thank', 'thx', 'ty'], phrases: ['thank you'] },
    { id: 'bye', w: 5, words: ['bye', 'goodbye', 'later', 'ciao', 'cya'], phrases: ['see you', 'good night'] },
    { id: 'greet', w: 5, words: ['hi', 'hello', 'hey', 'yo', 'howdy', 'hola', 'hiya', 'morning', 'afternoon', 'evening'], phrases: ['how are you', 'whats up', "what's up", 'good morning'] }
  ];

  /* "who are you" about the bot should be greet/about hybrid — handled after scoring */

  function tokens(s) {
    return String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9.+#]+/g, ' ').split(/\s+/).filter(function (t) { return t.length > 1; });
  }
  function dist(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length, i, j, prev, cur, tmp, k;
    if (Math.abs(m - n) > 2) return 99;
    prev = [];
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) {
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
      }
      prev = cur;
    }
    return prev[n];
  }
  function fuzzyHit(tok, word) {
    if (tok === word) return 2;
    if (word.length >= 4 && tok.length >= 4 && (word.indexOf(tok) === 0 || tok.indexOf(word) === 0)) return 1.4;
    if (word.length >= 4 && tok.length >= 4 && dist(tok, word) <= 1) return 1.2;
    return 0;
  }

  function match(q) {
    var ql = q.toLowerCase().trim();
    var toks = tokens(ql);
    if (!toks.length) return 'greet';

    // Bot self-id
    if (/who are you|what are you|are you (a )?bot|your name/.test(ql) && !/markandeyulu|nistala|he is|developer/.test(ql)) {
      return { id: 'greet', custom: 'I’m a helper on this site — a small client-side assistant, not a live person or a cloud model. I answer from Markandeyulu Nistala’s published resume and site content only. What would you like to know?' };
    }

    var scores = {};
    INTENTS.forEach(function (it) {
      var s = 0;
      (it.phrases || []).forEach(function (p) { if (ql.indexOf(p) !== -1) s += 6; });
      toks.forEach(function (t) {
        var bestH = 0;
        it.words.forEach(function (w) { bestH = Math.max(bestH, fuzzyHit(t, w)); });
        s += bestH;
      });
      if (s) scores[it.id] = (scores[it.id] || 0) + s * it.w;
    });
    var best = 'fallback', bestS = 0;
    Object.keys(scores).forEach(function (id) {
      if (scores[id] > bestS) { bestS = scores[id]; best = id; }
    });
    if (bestS < 8) return 'fallback';
    var generic = { greet:1, about:1, name:1, thanks:1, bye:1 };
    if (generic[best]) {
      var spec = Object.keys(scores).filter(function (id) { return !generic[id] && scores[id] >= 8; })
        .sort(function (a, b) { return scores[b] - scores[a]; })[0];
      if (spec) best = spec;
    }
    if (best === 'phone' && /iphone|ipad|ios|app/.test(ql) && !/number|call|whatsapp|telephone/.test(ql)) {
      return scores.apps >= (scores.skills||0) ? 'apps' : (scores.experience ? 'experience' : 'skills');
    }
    return best;
  }

  var CHIPS = {
    greet: ['Experience', 'Skills', 'Apps', 'Blog', 'Contact', 'Resume'],
    fallback: ['Experience', 'Skills', 'Apps', 'Blog', 'Contact', 'Resume'],
    about: ['Experience', 'Apps', 'Education'],
    experience: ['Flying Flea / BLE', 'Colour Moon', 'Skills'],
    innominds: ['BLE', 'Apps', 'Contact'],
    colour: ['Apps', 'Skills'],
    ble: ['Read the BLE post', 'Flying Flea', 'Skills'],
    apps: ['Flying Flea', 'Skills', 'Resume'],
    skills: ['Experience', 'AI work', 'Blog'],
    education: ['Experience', 'Skills'],
    blog: ['BLE post', 'WidgetKit post', 'Contact'],
    resume: ['Contact', 'Experience'],
    contact: ['Resume', 'Blog'],
    social: ['Email / contact', 'Resume'],
    phone: ['Email / contact', 'Resume'],
    ai: ['Skills', 'Experience'],
    where: ['Experience', 'Contact'],
    thanks: ['Experience', 'Contact'],
    bye: ['Contact', 'Resume'],
    name: ['About him', 'Experience']
  };

  function chipQuery(label) {
    var map = {
      'Experience': 'Tell me about his experience',
      'Skills': 'What is his tech stack?',
      'Apps': 'What apps has he built?',
      'Blog': 'What has he written on the blog?',
      'Contact': 'How can I contact him?',
      'Resume': 'How do I download his resume?',
      'Flying Flea / BLE': 'Tell me about the Flying Flea app and BLE',
      'Flying Flea': 'Tell me about the Flying Flea app',
      'Colour Moon': 'What did he do at Colour Moon?',
      'BLE': 'Tell me about his BLE work',
      'Read the BLE post': 'Tell me about the BLE blog post',
      'BLE post': 'Tell me about the BLE blog post',
      'WidgetKit post': 'Tell me about the WidgetKit blog post',
      'AI work': 'How does he use AI?',
      'Education': 'Where did he study?',
      'Email / contact': 'How can I contact him?',
      'About him': 'Who is Markandeyulu Nistala?'
    };
    return map[label] || label;
  }

  /* ----- DOM ----- */
  var WAVE_TEXT = 'Hi! Ask me about Markandeyulu';
  var root = document.createElement('div');
  root.className = 'cb-root';
  root.innerHTML =
    '<div class="cb-wave" hidden role="status"></div>' +
    '<div id="cb-panel" class="cb-panel" role="dialog" aria-modal="true" aria-labelledby="cb-title" hidden>' +
      '<div class="cb-head">' + robotSvg('cb-headbot') +
        '<div><h2 id="cb-title">Ask about Markandeyulu</h2><p>Answers from this site only</p></div>' +
        '<button type="button" class="cb-close" aria-label="Close chat">×</button>' +
      '</div>' +
      '<div class="cb-log" aria-live="polite" data-allow-select></div>' +
      '<div class="cb-chips" hidden></div>' +
      '<form class="cb-form" action="#">' +
        '<input type="text" name="q" autocomplete="off" enterkeyhint="send" maxlength="400" aria-label="Ask a question" placeholder="Ask about his work, skills, apps…">' +
        '<button type="submit" class="cb-send" aria-label="Send">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
        '</button>' +
      '</form>' +
    '</div>' +
    '<button type="button" class="cb-launch" aria-label="Open chat about Markandeyulu" aria-expanded="false" aria-controls="cb-panel">' +
      robotSvg() +
    '</button>';
  document.body.appendChild(root);

  var launch = root.querySelector('.cb-launch');
  var panel = root.querySelector('.cb-panel');
  var closeBtn = root.querySelector('.cb-close');
  var logEl = root.querySelector('.cb-log');
  var chipsEl = root.querySelector('.cb-chips');
  var form = root.querySelector('.cb-form');
  var input = form.querySelector('input');
  var wave = root.querySelector('.cb-wave');
  var lastFocus = null;
  var greeted = false;
  var typing = false;
  var waveCount = 0;
  var typeTimer = 0;
  var nudgeTimer = 0;
  var waveArmTimer = 0;
  var eyeRaf = 0;
  var mx = 0, my = 0;

  function launchMascot() { return launch.querySelector('.cb-mascot'); }
  function headMascot() { return root.querySelector('.cb-head .cb-mascot'); }

  function setPupils(el, x, y) {
    if (!el) return;
    var g = el.querySelector('.cb-pupils');
    if (!g) return;
    g.style.setProperty('--ex', x + 'px');
    g.style.setProperty('--ey', y + 'px');
  }
  function setMood(which, mood) {
    var el = which === 'head' ? headMascot() : launchMascot();
    if (!el) return;
    el.classList.remove('cb-mood-think', 'cb-mood-talk', 'cb-mood-happy', 'waving');
    if (mood) el.classList.add('cb-mood-' + mood);
  }

  /* eyes follow the pointer — rAF-throttled */
  function tickEyes() {
    eyeRaf = 0;
    if (reduced) return;
    var el = launchMascot();
    if (!el) return;
    var r = launch.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1;
    var max = 3.2, k = Math.min(1, d / 90);
    setPupils(el, (dx / d) * max * k, (dy / d) * max * k);
  }
  document.addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (!reduced && !eyeRaf) eyeRaf = requestAnimationFrame(tickEyes);
  }, { passive: true });

  function clearType() { if (typeTimer) { clearInterval(typeTimer); typeTimer = 0; } }

  function showWave(nudge) {
    if (sessionStorage.getItem('cb-opened')) return;
    if (root.classList.contains('open')) return;
    if (waveCount >= 3) return;
    waveCount++;
    clearType();
    wave.hidden = false;
    wave.classList.remove('cb-wave-in', 'cb-wave-nudge');
    void wave.offsetWidth;
    wave.classList.add(nudge ? 'cb-wave-nudge' : 'cb-wave-in');
    if (reduced) { wave.textContent = WAVE_TEXT; return; }
    var i = 0;
    wave.textContent = '';
    var caret = document.createElement('span');
    caret.className = 'cb-caret';
    caret.setAttribute('aria-hidden', 'true');
    function tick() {
      i++;
      wave.textContent = WAVE_TEXT.slice(0, i);
      if (i < WAVE_TEXT.length) wave.appendChild(caret);
      if (i >= WAVE_TEXT.length) { clearType(); }
    }
    typeTimer = setInterval(tick, 28);
    tick();
  }
  function scheduleNudge() {
    if (nudgeTimer) clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(function () {
      if (sessionStorage.getItem('cb-opened') || root.classList.contains('open') || waveCount >= 3) return;
      showWave(true);
      scheduleNudge();
    }, 25000);
  }
  setTimeout(function () { showWave(false); scheduleNudge(); }, reduced ? 600 : 2800);

  if (!reduced) {
    waveArmTimer = setInterval(function () {
      if (root.classList.contains('open') || document.hidden) return;
      launch.classList.add('waving');
      setTimeout(function () { launch.classList.remove('waving'); }, 1000);
    }, 7000);
    setTimeout(function () { launch.classList.add('waving'); setTimeout(function () { launch.classList.remove('waving'); }, 1000); }, 4200);
  }

  function openPanel() {
    lastFocus = document.activeElement;
    wave.hidden = true;
    clearType();
    if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = 0; }
    sessionStorage.setItem('cb-opened', '1');
    panel.hidden = false;
    if (!reduced) {
      launch.classList.remove('cb-jump');
      void launch.offsetWidth;
      launch.classList.add('cb-jump');
      setTimeout(function () { launch.classList.remove('cb-jump'); }, 650);
    }
    root.classList.add('open');
    launch.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      greeted = true;
      addBot(ANS.greet, 'greet', true);
    }
    setTimeout(function () { input.focus(); }, reduced ? 0 : 350);
  }
  function closePanel() {
    root.classList.remove('open');
    launch.setAttribute('aria-expanded', 'false');
    setMood('head', '');
    setMood('launch', '');
    setTimeout(function () { if (!root.classList.contains('open')) panel.hidden = true; }, reduced ? 0 : 400);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    else launch.focus();
  }
  function toggle() { root.classList.contains('open') ? closePanel() : openPanel(); }

  launch.addEventListener('click', toggle);
  closeBtn.addEventListener('click', closePanel);
  wave.addEventListener('click', openPanel);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && root.classList.contains('open')) { e.preventDefault(); closePanel(); }
  });

  panel.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = panel.querySelectorAll('a,button,input,textarea,[tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (el) { return !el.disabled && el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  function addUser(text) {
    var d = document.createElement('div');
    d.className = 'cb-msg user';
    d.textContent = text;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function addBot(html, intent, instant) {
    var row = document.createElement('div');
    row.className = 'cb-row';
    row.innerHTML = robotSvg('cb-mini') + '<div class="cb-msg bot"></div>';
    var box = row.querySelector('.cb-msg');
    logEl.appendChild(row);
    function paint() {
      box.innerHTML = '<p>' + html + '</p>';
      renderChips(intent);
      logEl.scrollTop = logEl.scrollHeight;
      setMood('head', 'happy');
      setMood('launch', 'happy');
      typing = false;
      setTimeout(function () { if (!typing) { setMood('head', ''); setMood('launch', ''); } }, 1400);
    }
    if (instant || reduced) { paint(); return; }
    typing = true;
    setMood('head', 'talk');
    setMood('launch', 'think');
    box.innerHTML = '<div class="cb-type" aria-label="Thinking"><i></i><i></i><i></i></div>';
    logEl.scrollTop = logEl.scrollHeight;
    setTimeout(paint, 420 + Math.min(900, html.length * 8));
  }
  function renderChips(intent) {
    var list = CHIPS[intent] || CHIPS.fallback;
    chipsEl.innerHTML = '';
    if (!list || !list.length) { chipsEl.hidden = true; return; }
    list.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cb-chip';
      b.textContent = label;
      b.addEventListener('click', function () { ask(chipQuery(label)); });
      chipsEl.appendChild(b);
    });
    chipsEl.hidden = false;
  }

  function ask(text) {
    text = String(text || '').trim();
    if (!text || typing) return;
    if (!root.classList.contains('open')) openPanel();
    addUser(text);
    input.value = '';
    var res = match(text);
    var id = typeof res === 'string' ? res : res.id;
    var html = typeof res === 'string' ? ANS[res] : (res.custom || ANS[res.id]);
    addBot(html, id, false);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
  });

  window.__cb = { open: openPanel, close: closePanel, ask: ask, match: match, ANS: ANS, root: root };
})();
