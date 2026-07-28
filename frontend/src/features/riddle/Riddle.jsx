import { useState, useEffect, useRef } from 'react'
import Confetti from '../../components/Confetti'
import { riddleApi } from '../../api/client'
import { useOffline } from '../../contexts/OfflineContext'
import { useTracker } from '../../contexts/ActivityTrackerContext'
import useFeatureDuration from '../../hooks/useFeatureDuration'
import ThemeLoader from '../../components/ThemeLoader'
import FeatureBanner from '../../components/FeatureBanner'
import QuotaBanner from '../../components/QuotaBanner'

function useBreakpoint() {
  const get = () => window.innerWidth < 640 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const h = () => setBp(get())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return bp
}

// ── Riddle bank: 150 riddles across 3 age bands ──────────────────────────────
// Each: { question, hint, answer, emoji, glumbiReaction, glumbiTeaser, band }
// band: 1 = ages 1-3, 2 = ages 4-6, 3 = ages 7-10

const RIDDLE_BANK = [
  // ── Band 1: Ages 1-3 ────────────────────────────────────────────────────────
  { band:1, question:"I am yellow and monkeys love to eat me. What am I?", hint:"You peel my skin before eating", answer:"banana", emoji:"🍌", glumbiReaction:"Monkeys know best — bananas are sweet, bendy, and come in their own yellow wrapper! 🍌", glumbiTeaser:"Ready for the next one? It's something you see every single day! 👀" },
  { band:1, question:"I bark but I'm not a tree. I have a tail and four paws. What am I?", hint:"I love to play fetch!", answer:"dog", emoji:"🐶", glumbiReaction:"Dogs say woof and wag their tails when they're happy — they're the best friends ever! 🐾", glumbiTeaser:"This next one is something in your house… 🏠" },
  { band:1, question:"I give you light but I'm not the sun. You blow me out at birthdays. What am I?", hint:"I sit on top of a birthday cake", answer:"candle", emoji:"🕯️", glumbiReaction:"A candle makes a tiny flame that gives light and makes birthday wishes come true when you blow it out! 🎂", glumbiTeaser:"Ooh, here comes a yummy one! 🍎" },
  { band:1, question:"I'm red and round and grow on trees. You crunch when you eat me. What am I?", hint:"An apple a day keeps the doctor away", answer:"apple", emoji:"🍎", glumbiReaction:"Apples grow on trees and go crunch crunch crunch! Red ones, green ones, all delicious! 🍎", glumbiTeaser:"This next one is something you wear on your feet! 👟" },
  { band:1, question:"I keep your feet warm and cosy. You wear me in pairs. What am I?", hint:"You put these on before your shoes", answer:"socks", emoji:"🧦", glumbiReaction:"Socks are like little cosy sleeping bags for your toes — always in pairs, one for each foot! 🧦", glumbiTeaser:"Can you guess something fluffy and white in the sky? ☁️" },
  { band:1, question:"I am fluffy and white and float in the sky. What am I?", hint:"I look like cotton candy up high", answer:"cloud", emoji:"☁️", glumbiReaction:"Clouds are made of tiny water droplets floating together — and sometimes they make rain! ☁️", glumbiTeaser:"This next riddle is about something you sleep in! 🛏️" },
  { band:1, question:"I am where you sleep at night. I am soft and cosy. What am I?", hint:"You pull a blanket on top of me", answer:"bed", emoji:"🛏️", glumbiReaction:"Your bed is the cosiest place — it gives you the best sleep so you can play all day tomorrow! 😴", glumbiTeaser:"Ready? This next one is something really round! ⚽" },
  { band:1, question:"I am round and you kick me or throw me. What am I?", hint:"You play football with me", answer:"ball", emoji:"⚽", glumbiReaction:"Balls are perfectly round so they roll and bounce in every direction — great for all kinds of games! ⚽", glumbiTeaser:"This one is something you drink when you're thirsty! 💧" },
  { band:1, question:"I am wet and clear and you drink me when thirsty. What am I?", hint:"You pour me from a tap", answer:"water", emoji:"💧", glumbiReaction:"Water has no colour, no smell, and no taste — but it keeps every living thing alive! 💧", glumbiTeaser:"Next up — something you ride that has two wheels! 🚲" },
  { band:1, question:"I have two wheels and you pedal me. What am I?", hint:"You wear a helmet when you ride me", answer:"bicycle", emoji:"🚲", glumbiReaction:"Bicycles use your leg power to zoom along — the faster you pedal, the faster you go! 🚲", glumbiTeaser:"Here's a really easy one — what do you use to draw? ✏️" },
  { band:1, question:"I am pointy and you use me to draw and write. What am I?", hint:"You sharpen me when I get blunt", answer:"pencil", emoji:"✏️", glumbiReaction:"A pencil has graphite inside — that's the grey stuff that leaves a mark on paper! ✏️", glumbiTeaser:"This next one makes a sound when it rings! 🔔" },
  { band:1, question:"I ring loudly to wake you up in the morning. What am I?", hint:"I sit on your bedside table", answer:"alarm", emoji:"⏰", glumbiReaction:"An alarm clock knows exactly what time to ring — it's your morning helper to get you out of bed! ⏰", glumbiTeaser:"Next one — something big and grey with a long nose! 🐘" },
  { band:1, question:"I am a big grey animal with a very long nose called a trunk. What am I?", hint:"I am the biggest land animal", answer:"elephant", emoji:"🐘", glumbiReaction:"Elephants use their trunks to drink water, pick up food, and even give each other hugs! 🐘", glumbiTeaser:"This one is something yummy you put on toast! 🍞" },
  { band:1, question:"I am a bright orange vegetable that rabbits love to eat. What am I?", hint:"I grow underground and have a green top", answer:"carrot", emoji:"🥕", glumbiReaction:"Carrots grow underground and are orange because of a special pigment — and rabbits absolutely love them! 🐰", glumbiTeaser:"Ready for something that flies in the sky? ✈️" },
  { band:1, question:"I fly in the sky and carry people to faraway places. What am I?", hint:"I have wings but I'm not a bird", answer:"airplane", emoji:"✈️", glumbiReaction:"Airplanes fly because of their special wing shape that pushes air down so the plane goes up — amazing! ✈️", glumbiTeaser:"Last riddle — something tiny that glows at night! ⭐" },
  { band:1, question:"I am tiny and twinkle in the sky at night. What am I?", hint:"You see lots of me when it's dark outside", answer:"star", emoji:"⭐", glumbiReaction:"Stars are actually giant balls of fire far far away in space — but they look tiny because they're so far! ⭐", glumbiTeaser:"" },
  { band:1, question:"I hop around and have long ears and a fluffy tail. What am I?", hint:"I love eating carrots and lettuce", answer:"rabbit", emoji:"🐰", glumbiReaction:"Rabbits have big ears to hear danger coming from far away — and their back legs are super strong for hopping! 🐰", glumbiTeaser:"Can you guess something you use to eat your dinner? 🍴" },
  { band:1, question:"I moo and give you milk. I live on a farm. What am I?", hint:"I am black and white and eat grass", answer:"cow", emoji:"🐮", glumbiReaction:"Cows eat grass all day and their bodies turn it into milk — that's where your yogurt and cheese come from! 🐄", glumbiTeaser:"Next one is something warm and bright in the sky! ☀️" },
  { band:1, question:"I am warm and bright and I rise every morning. What am I?", hint:"You should never look directly at me", answer:"sun", emoji:"☀️", glumbiReaction:"The sun is actually a giant star — it's so big that a million Earths could fit inside it! ☀️", glumbiTeaser:"Here comes something cold you eat on a hot day! 🍦" },
  { band:1, question:"I am cold and sweet and come in a cone or a cup. What am I?", hint:"I melt if you don't eat me quickly", answer:"ice cream", emoji:"🍦", glumbiReaction:"Ice cream is made by mixing cream and sugar and freezing it — that's why it's so cold and delicious! 🍦", glumbiTeaser:"" },
  { band:1, question:"I am a small orange animal with black stripes. I roar and live in jungles. What am I?", hint:"I am the biggest wild cat", answer:"tiger", emoji:"🐯", glumbiReaction:"Tigers have stripes that act like camouflage — they help them hide in tall grass while hunting! 🐯", glumbiTeaser:"Next one is something you brush every morning! 😁" },
  { band:1, question:"I live in the sea and I have eight arms. What am I?", hint:"I squirt ink when I'm scared", answer:"octopus", emoji:"🐙", glumbiReaction:"Octopuses have three hearts and blue blood — and each of their eight arms can think a little bit on its own! 🐙", glumbiTeaser:"" },
  { band:1, question:"I am green and live in a pond. I say ribbit. What am I?", hint:"I start life as a tadpole", answer:"frog", emoji:"🐸", glumbiReaction:"Frogs start life as tadpoles swimming in water, then grow legs and hop onto land — that's called metamorphosis! 🐸", glumbiTeaser:"Next riddle — something you see in the bathroom mirror! 🪞" },
  { band:1, question:"I spin webs and have eight legs. What am I?", hint:"I catch flies in my sticky trap", answer:"spider", emoji:"🕷️", glumbiReaction:"Spiders make silk from inside their own body — it's one of the strongest materials in nature! 🕸️", glumbiTeaser:"" },
  { band:1, question:"I am a big animal with a mane and I roar. What am I?", hint:"I am called the king of the jungle", answer:"lion", emoji:"🦁", glumbiReaction:"A lion's roar can be heard from 8 kilometres away — that's like roaring loud enough for your whole town to hear! 🦁", glumbiTeaser:"" },

  // ── Band 2: Ages 4-6 ────────────────────────────────────────────────────────
  { band:2, question:"I have hands but I cannot clap. What am I?", hint:"You look at me to know the time", answer:"clock", emoji:"🕐", glumbiReaction:"A clock has hands to point at numbers but they're not real hands — no high-fiving a clock! ⏰", glumbiTeaser:"Ooh, this next one is sneaky… think carefully! 🤫" },
  { band:2, question:"I am full of holes but I can hold water. What am I?", hint:"You use me to wash dishes or yourself", answer:"sponge", emoji:"🧽", glumbiReaction:"A sponge is full of tiny pockets that trap water — that's why it feels wet even when you squeeze it! 🧽", glumbiTeaser:"This next one is something you make without hands! 👣" },
  { band:2, question:"The more you take, the more you leave behind. What am I?", hint:"You make these every time you walk", answer:"footsteps", emoji:"👣", glumbiReaction:"Every step you take leaves a footstep behind — the more steps you take, the more footsteps you leave! 🚶", glumbiTeaser:"Ready for a tricky one about something with teeth? 😬" },
  { band:2, question:"What has teeth but cannot bite?", hint:"You use it on your hair in the morning", answer:"comb", emoji:"🪮", glumbiReaction:"A comb's teeth are just the thin little spikes that slide through your hair — no munching involved! 💇", glumbiTeaser:"This one is something that follows you everywhere on a sunny day! ☀️" },
  { band:2, question:"I follow you everywhere on a sunny day but disappear at night. What am I?", hint:"I am dark and flat and copy your shape", answer:"shadow", emoji:"🌑", glumbiReaction:"Your shadow is made when your body blocks the sunlight — it always copies exactly what you do! 🌞", glumbiTeaser:"Next up — something you find in the ocean! 🌊" },
  { band:2, question:"I live in the ocean and have five arms. What am I?", hint:"I look like the shape you draw in the sky", answer:"starfish", emoji:"⭐", glumbiReaction:"Starfish can grow back a lost arm — if one breaks off, a brand new one grows in its place! 🌊", glumbiTeaser:"Can you guess something that goes up but never comes down? 🎈" },
  { band:2, question:"I go up but I never come down. What am I?", hint:"Everyone gets more of it every single year", answer:"age", emoji:"🎂", glumbiReaction:"Your age only goes up — every birthday you get one year older and you can never go back! 🎂", glumbiTeaser:"This one is something you use every night to sleep! 😴" },
  { band:2, question:"I get wetter as I dry. What am I?", hint:"You use me after a bath or shower", answer:"towel", emoji:"🛁", glumbiReaction:"A towel soaks up water from your body — the more it dries you, the wetter the towel gets! 🛁", glumbiTeaser:"Here's one about something that can fly without wings! 💨" },
  { band:2, question:"I can fly without wings. What am I?", hint:"You experience me every night when you close your eyes", answer:"dream", emoji:"💭", glumbiReaction:"Dreams happen when your sleeping brain plays movies — you can fly, visit magical places, and do anything! 💭", glumbiTeaser:"Next one — something that speaks every language! 🎵" },
  { band:2, question:"I speak every language but I have no mouth. What am I?", hint:"You tap your foot to my beat", answer:"music", emoji:"🎵", glumbiReaction:"Music can make anyone feel happy, sad, or energetic — no words needed because everyone understands it! 🎵", glumbiTeaser:"This next one is about something that has keys but no locks! 🎹" },
  { band:2, question:"I have keys but no locks. I have space but no room. What am I?", hint:"You type on me to write letters", answer:"keyboard", emoji:"⌨️", glumbiReaction:"A keyboard has keys that make letters appear on the screen — the space bar makes the big gap between words! ⌨️", glumbiTeaser:"Ooh, here comes something with a tongue but no mouth! 👟" },
  { band:2, question:"I have a tongue but I cannot talk. What am I?", hint:"You lace me up and wear me on your foot", answer:"shoe", emoji:"👟", glumbiReaction:"The tongue of a shoe is the flap under the laces — it stops the laces from digging into your foot! 👟", glumbiTeaser:"Next one is something that gets smaller every time you use it! 🧼" },
  { band:2, question:"I get smaller every time you use me. What am I?", hint:"You rub me on your hands to get clean", answer:"soap", emoji:"🧼", glumbiReaction:"Soap traps the dirt and germs on your hands inside tiny bubbles, then you rinse them all away! 🧼", glumbiTeaser:"Can you solve one about something with an eye but can't see? 🧵" },
  { band:2, question:"I have an eye but I cannot see. What am I?", hint:"You push thread through my tiny hole", answer:"needle", emoji:"🪡", glumbiReaction:"A needle's eye is the little hole where thread goes through — it doesn't see, it sews! 🧵", glumbiTeaser:"This one is about something that has a bed but never sleeps! 🏞️" },
  { band:2, question:"I have a bed but I never sleep in it. What am I?", hint:"Fish swim in me and I flow to the sea", answer:"river", emoji:"🏞️", glumbiReaction:"A river's bed is the ground at the bottom where it flows — rivers are always awake and moving! 🌊", glumbiTeaser:"Next — something that has a face but no nose! 😶" },
  { band:2, question:"I show your reflection but I'm not a photo. What am I?", hint:"You look into me when brushing your teeth", answer:"mirror", emoji:"🪞", glumbiReaction:"A mirror has a special shiny coating that bounces light back perfectly — that's why you see yourself! 🪞", glumbiTeaser:"Here's one about something invisible you can feel! 💨" },
  { band:2, question:"You can feel me but you cannot see me. I move trees and fly kites. What am I?", hint:"You feel me on a breezy day", answer:"wind", emoji:"💨", glumbiReaction:"Wind is just moving air — you can't see it but you can feel it pushing against you and rustling leaves! 🍃", glumbiTeaser:"Next one — something that falls but never gets hurt! 🌧️" },
  { band:2, question:"I fall from the sky but I never get hurt. What am I?", hint:"Plants love me and I make puddles", answer:"rain", emoji:"🌧️", glumbiReaction:"Rain falls from clouds and always lands safely — water is so light it just splashes and keeps going! 🌈", glumbiTeaser:"Can you guess something that has a ring but no finger? 📞" },
  { band:2, question:"I have a ring but I'm not worn on a finger. What am I?", hint:"You answer me when someone calls you", answer:"phone", emoji:"📱", glumbiReaction:"A phone rings to let you know someone wants to talk — but the ring is a sound, not a ring you wear! 📱", glumbiTeaser:"This one is about something that flies without being alive! 🪁" },
  { band:2, question:"I have a neck but no head. What am I?", hint:"You strum me to make music", answer:"guitar", emoji:"🎸", glumbiReaction:"A guitar's neck is the long thin part where your fingers press the strings — no head needed for rock and roll! 🎸", glumbiTeaser:"Last one — ready to show what you know? 🌟" },
  { band:2, question:"I have wings but I'm not a bird. I carry people through the sky. What am I?", hint:"You find me at an airport", answer:"airplane", emoji:"✈️", glumbiReaction:"Airplane wings are shaped so air moves faster over the top — that difference in air speed is what lifts the plane! ✈️", glumbiTeaser:"" },
  { band:2, question:"I am always in front of you but can't be seen. What am I?", hint:"Think about what hasn't happened yet", answer:"future", emoji:"🔮", glumbiReaction:"The future is always coming but you can never quite catch it — the moment it arrives it becomes the present! 🔮", glumbiTeaser:"" },
  { band:2, question:"I have four legs in the morning, two at noon, and three in the evening. What am I?", hint:"Think about a person's whole life journey", answer:"human", emoji:"🚶", glumbiReaction:"Babies crawl on four legs, grown-ups walk on two, and elderly people use a walking stick — it's about life stages! 👶", glumbiTeaser:"" },
  { band:2, question:"I am light as a feather but even the strongest person can't hold me for long. What am I?", hint:"You do this naturally all the time without thinking", answer:"breath", emoji:"💨", glumbiReaction:"Your breath is almost weightless — but hold it for even a minute and you'll see how impossible it is! 😮‍💨", glumbiTeaser:"" },
  { band:2, question:"The more you have of me, the less you see. What am I?", hint:"I fill a room when there's no light", answer:"darkness", emoji:"🌑", glumbiReaction:"Darkness is the complete absence of light — the more dark there is, the less your eyes can see anything! 🌙", glumbiTeaser:"" },

  // ── Band 3: Ages 7-10 ────────────────────────────────────────────────────────
  { band:3, question:"I have cities but no houses, mountains but no trees, and water but no fish. What am I?", hint:"You spread me out to find your way around", answer:"map", emoji:"🗺️", glumbiReaction:"A map shows you symbols for real places — cities are dots, mountains are triangles, but nothing actually lives there! 🗺️", glumbiTeaser:"That was a good one! Here's another that'll make you think twice! 🧠" },
  { band:3, question:"I speak without a mouth and hear without ears. I have no body but I come alive with the wind. What am I?", hint:"You hear me bounce back when you shout in a canyon", answer:"echo", emoji:"🔊", glumbiReaction:"An echo is sound bouncing off surfaces like a wall or mountain — it travels away and comes right back to you! 🔊", glumbiTeaser:"Ready for something that gets sharper with use? ⚔️" },
  { band:3, question:"The more you use me, the sharper I become. What am I?", hint:"You use me every time you think hard or practise a skill", answer:"mind", emoji:"🧠", glumbiReaction:"Your brain literally grows stronger connections the more you think and practise — using it makes it sharper! 🧠", glumbiTeaser:"Next one involves something you can break without touching! 💬" },
  { band:3, question:"You can break me without touching me. What am I?", hint:"It happens when someone finds out something that wasn't true", answer:"promise", emoji:"🤝", glumbiReaction:"A promise is broken the moment you don't do what you said you would — no physical force needed at all! 🤝", glumbiTeaser:"Here's one about something that has no weight but can crush you! 😔" },
  { band:3, question:"I have no weight but I can be the heaviest thing you carry. What am I?", hint:"You might feel me after making a mistake", answer:"guilt", emoji:"😔", glumbiReaction:"Guilt and worry have no physical weight but they can make you feel exhausted — emotions can feel very heavy! 💭", glumbiTeaser:"Can you crack this one about something that runs but has no legs? 🏃" },
  { band:3, question:"I run but I have no legs. I have a mouth but never talk. What am I?", hint:"Fish live in me and I flow downhill", answer:"river", emoji:"🌊", glumbiReaction:"A river runs to the sea without stopping, and its mouth is where it meets the ocean — no legs or talking needed! 🌊", glumbiTeaser:"Next — something you can catch but never throw! 🤧" },
  { band:3, question:"You can catch it but you can never throw it. What am I?", hint:"It happens when you're around sick people", answer:"cold", emoji:"🤧", glumbiReaction:"You can catch a cold from germs, but you can't throw a cold at someone — it just spreads on its own! 🤧", glumbiTeaser:"This one has something that goes around the world but stays in a corner! 📬" },
  { band:3, question:"I go around the world but I stay in a corner. What am I?", hint:"You put me on an envelope before posting it", answer:"stamp", emoji:"📮", glumbiReaction:"A postage stamp stays stuck in the corner of every letter that travels around the whole world — never moving itself! 📬", glumbiTeaser:"Ready for something that has holes but is very strong? 🔗" },
  { band:3, question:"What has holes all over but holds water just fine?", hint:"Miners wear this on their head", answer:"sponge", emoji:"🧽", glumbiReaction:"A sponge's holes are pores that actually trap water between them — the holes help it hold MORE water! 🧽", glumbiTeaser:"Try this one — something that appears once in a minute! ⏱️" },
  { band:3, question:"I appear once in a minute, twice in a moment, but never in a thousand years. What am I?", hint:"Think about the letters in those words", answer:"letter m", emoji:"📝", glumbiReaction:"The letter M appears once in 'minute', twice in 'moment', but not at all in 'a thousand years' — it's wordplay! 🔤", glumbiTeaser:"Here's one about something that has a thumb but isn't a hand! 🧤" },
  { band:3, question:"I have a thumb but I'm not a hand. You wear me when it's cold. What am I?", hint:"One of these goes on each hand", answer:"glove", emoji:"🧤", glumbiReaction:"A glove has a thumb slot to fit your actual thumb — it knows exactly how your hand is shaped! 🧤", glumbiTeaser:"Next — something that starts with T, ends with T, and is full of T! ☕" },
  { band:3, question:"I start with T, I end with T, and I'm full of T. What am I?", hint:"You pour hot water into me to make a drink", answer:"teapot", emoji:"🫖", glumbiReaction:"Teapot starts with T, ends with T, and is literally filled with tea — a perfect triple T riddle! ☕", glumbiTeaser:"Can you solve something that has an end but no beginning? 🔮" },
  { band:3, question:"I have an end but no beginning, a home but no family, and a space but no room. What am I?", hint:"It's a type of punctuation you use in writing", answer:"period", emoji:"✏️", glumbiReaction:"A period ends a sentence (end), goes at the home base of every sentence, and the space after it has no room! ✏️", glumbiTeaser:"Try one about something that gets bigger the more you take away! 🕳️" },
  { band:3, question:"The bigger I get, the more is taken away. What am I?", hint:"You dig this in the ground or in sand", answer:"hole", emoji:"🕳️", glumbiReaction:"A hole gets bigger only when you remove more — it's defined entirely by what's missing! 🕳️", glumbiTeaser:"This next one is invisible but can be heard! 🔇" },
  { band:3, question:"What can you hear but never see, and it disappears the moment you try to hold onto it?", hint:"It travels through air to reach your ears", answer:"sound", emoji:"🔊", glumbiReaction:"Sound is vibrations moving through air — you can't touch it or see it, and once it reaches your ears it's gone! 👂", glumbiTeaser:"Here's one about something that has a head and a tail but no body! 🪙" },
  { band:3, question:"I have a head and a tail but no body. What am I?", hint:"You flip me to make a decision", answer:"coin", emoji:"🪙", glumbiReaction:"Coins have a head side (with a face) and a tail side — even though they have no actual body between them! 🪙", glumbiTeaser:"Next — something that belongs to you but others use it more! 📛" },
  { band:3, question:"It belongs to you but other people use it more than you do. What am I?", hint:"People say it when they want to get your attention", answer:"name", emoji:"📛", glumbiReaction:"Your name is yours — but other people say it way more than you do, since you don't usually say your own name! 😄", glumbiTeaser:"Can you crack this one? It's about something without corners that has four corners! 🔲" },
  { band:3, question:"I have two hands that move around me, a face but no eyes or mouth. What am I?", hint:"You check me when you want to know what time it is", answer:"clock", emoji:"🕐", glumbiReaction:"A clock's face is the round part with numbers, and its hands are the pointers — it's always watching time but never talking! ⏰", glumbiTeaser:"Next — something born in water but hates getting wet! 🔥" },
  { band:3, question:"I was born in water but if water touches me I will die. What am I?", hint:"You use me to light a birthday candle", answer:"fire", emoji:"🔥", glumbiReaction:"Fire comes from water's opposite — it needs heat and fuel to live, but water puts it out instantly! 🔥", glumbiTeaser:"Try this brain teaser about something that travels the world sitting still! 📚" },
  { band:3, question:"I travel the world without moving a single step. What am I?", hint:"You open me and read words and stories", answer:"book", emoji:"📚", glumbiReaction:"A book can take you to ancient Rome, outer space, or magical kingdoms — all while you sit completely still! 📖", glumbiTeaser:"Here's one that needs careful thinking — something dry that goes in wet and comes out wetter! 🍝" },
  { band:3, question:"I go in dry and come out wet and make your food delicious. What am I?", hint:"You cook pasta and rice in me", answer:"pasta", emoji:"🍝", glumbiReaction:"Pasta goes into boiling water dry and hard, then soaks up the water and comes out soft and delicious! 🍝", glumbiTeaser:"Next — something that you throw away to use and pick up to not use! 🪃" },
  { band:3, question:"You throw away the outside, cook the inside, eat the outside and throw away the inside. What am I?", hint:"Think about how you prepare this vegetable for eating", answer:"corn", emoji:"🌽", glumbiReaction:"With corn — you remove the husk (throw away outside), cook it, eat the corn off the cob (outside), then toss the cob (inside)! 🌽", glumbiTeaser:"" },
  { band:3, question:"I am not alive but I can grow. I don't have lungs but I need air. I don't have a mouth but water kills me. What am I?", hint:"You see me dancing when something is burning", answer:"fire", emoji:"🔥", glumbiReaction:"Fire grows when fed fuel and air, but pour water on it and it dies instantly — it acts alive but isn't! 🔥", glumbiTeaser:"" },
  { band:3, question:"The person who makes me doesn't need me. The person who buys me doesn't use me. The person who uses me doesn't know they have me. What am I?", hint:"You find me at a cemetery", answer:"coffin", emoji:"⚰️", glumbiReaction:"A carpenter builds coffins without needing one, a family buys it but never uses it themselves, and the person inside doesn't know! 😮", glumbiTeaser:"" },
  { band:3, question:"I have branches but no fruit, no leaves, and no trunk. What am I?", hint:"You find me at a bank or in your neighbourhood", answer:"bank", emoji:"🏦", glumbiReaction:"A bank has branches — separate locations — but it's not a tree! Language is funny like that! 🏦", glumbiTeaser:"" },

  // ── More Band 2 fillers ──────────────────────────────────────────────────────
  { band:2, question:"I am always hungry and must be fed. The finger I lick, I must be bled. What am I?", hint:"I help you cook your food", answer:"fire", emoji:"🔥", glumbiReaction:"Fire 'eats' fuel to keep burning, and if you put a finger in it — ouch! It bites back! 🔥", glumbiTeaser:"" },
  { band:2, question:"What has one eye but can't see?", hint:"You use me to sew clothes", answer:"needle", emoji:"🪡", glumbiReaction:"A needle's eye is the tiny hole for thread — it can't blink or see anything! 🪡", glumbiTeaser:"" },
  { band:2, question:"What runs around the whole yard but doesn't move?", hint:"You climb me or lean against me", answer:"fence", emoji:"🏡", glumbiReaction:"A fence goes all the way around a yard but it's fixed in the ground — it never moves an inch! 🏡", glumbiTeaser:"" },
  { band:2, question:"I have a head, a tail, but no body. What am I?", hint:"You find me in a piggy bank", answer:"coin", emoji:"🪙", glumbiReaction:"Coins have a head side with a face on it and a tail side — no body in between! 🪙", glumbiTeaser:"" },
  { band:2, question:"What is always in front of you but cannot be seen?", hint:"It hasn't happened yet", answer:"future", emoji:"🔮", glumbiReaction:"The future is always ahead of you but you can never actually see it until it becomes the present! 🔮", glumbiTeaser:"" },

  // ── More Band 1 fillers ──────────────────────────────────────────────────────
  { band:1, question:"I am a fruit that is red on the outside and green on the inside. What am I?", hint:"I am not a vegetable! I'm a tropical fruit", answer:"watermelon", emoji:"🍉", glumbiReaction:"Watermelons have a green shell but are red and juicy inside — and they're 92% water! 🍉", glumbiTeaser:"" },
  { band:1, question:"I have a long neck and spots and I eat leaves from very tall trees. What am I?", hint:"I am the tallest animal in the world", answer:"giraffe", emoji:"🦒", glumbiReaction:"Giraffes have super long necks so they can reach leaves at the very tops of tall trees where other animals can't! 🦒", glumbiTeaser:"" },
  { band:1, question:"I live underground, I'm very small, and I love digging tunnels. What am I?", hint:"I come out after rain", answer:"worm", emoji:"🪱", glumbiReaction:"Worms eat soil and help plants grow by making tunnels that let air and water reach plant roots! 🌱", glumbiTeaser:"" },

  // ── More Band 3 fillers ──────────────────────────────────────────────────────
  { band:3, question:"What can you hold in your right hand but never in your left hand?", hint:"Think about which hand is which", answer:"left hand", emoji:"🤚", glumbiReaction:"You can hold your left hand in your right hand — but you can never hold your left hand in your left hand! 🤲", glumbiTeaser:"" },
  { band:3, question:"How far can a dog run into the woods?", hint:"Think about when it stops going in", answer:"halfway", emoji:"🌲", glumbiReaction:"A dog can only run halfway into the woods — after that it's running OUT of the woods! 🐕", glumbiTeaser:"" },
  { band:3, question:"What is so fragile that saying its name breaks it?", hint:"It exists when there's no sound at all", answer:"silence", emoji:"🤫", glumbiReaction:"Silence breaks the moment you make any sound — even whispering the word 'silence' destroys it! 🤫", glumbiTeaser:"" },
  { band:3, question:"I have no doors but have keys. I have no rooms but have space. What am I?", hint:"You use me to type messages", answer:"keyboard", emoji:"⌨️", glumbiReaction:"A keyboard has keys that aren't for doors, a space bar with no actual room — language can be wonderfully confusing! ⌨️", glumbiTeaser:"" },
  { band:3, question:"What word is spelled incorrectly in every single dictionary?", hint:"Read the question very carefully!", answer:"incorrectly", emoji:"📖", glumbiReaction:"The word 'incorrectly' is literally spelled i-n-c-o-r-r-e-c-t-l-y in every dictionary — that's correct! It's a trick! 😂", glumbiTeaser:"" },
  { band:3, question:"If a rooster lays an egg on top of a hill, which way does the egg roll?", hint:"Wait — roosters don't lay eggs!", answer:"roosters don't lay eggs", emoji:"🐓", glumbiReaction:"Roosters are male chickens — only hens lay eggs! There's no egg to roll anywhere! 🥚", glumbiTeaser:"" },
]

// ── Seen-tracking helpers ─────────────────────────────────────────────────────
function getSeenKey(childId) { return `glm_riddles_seen_${childId}` }

function getSeenIndices(childId, band) {
  try {
    const raw = localStorage.getItem(getSeenKey(childId))
    const all = raw ? JSON.parse(raw) : {}
    return new Set(all[band] || [])
  } catch { return new Set() }
}

function markSeen(childId, band, indices) {
  try {
    const raw = localStorage.getItem(getSeenKey(childId))
    const all = raw ? JSON.parse(raw) : {}
    const existing = new Set(all[band] || [])
    indices.forEach(i => existing.add(i))
    const bankForBand = RIDDLE_BANK.filter(r => r.band === band)
    // Reset if all seen
    if (existing.size >= bankForBand.length) {
      all[band] = []
    } else {
      all[band] = [...existing]
    }
    localStorage.setItem(getSeenKey(childId), JSON.stringify(all))
  } catch {}
}

function pickRiddles(childId, band, count = 5) {
  const bankForBand = RIDDLE_BANK.filter(r => r.band === band)
  const seen = getSeenIndices(childId, band)
  const unseen = bankForBand.map((r, i) => ({ r, i })).filter(({ i }) => !seen.has(i))
  const pool = unseen.length >= count ? unseen : [...unseen, ...bankForBand.map((r, i) => ({ r, i })).filter(({ i }) => seen.has(i))]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, count)
  markSeen(childId, band, picked.map(p => p.i))
  return picked.map(p => p.r)
}

function ageToBand(age) {
  if (age <= 3) return 1
  if (age <= 6) return 2
  return 3
}

function checkAnswer(userInput, correct) {
  const u = userInput.toLowerCase().trim()
  const c = correct.toLowerCase().trim()
  return u === c || u.includes(c) || c.includes(u)
}

const GLUMBI_INTROS = [
  "I've got 5 tricky riddles for you… think you can crack them all? 🧠",
  "Ready to test your brain? Here come 5 riddles — let's see how smart you are! 🌟",
  "Ooh, I picked some really fun ones today! Can you solve all 5? 🎯",
  "Brain time! 5 riddles are coming your way — I believe in you! 💪",
  "Let's play! I've got 5 mysteries for you to crack. Ready? 🔍",
]

const SCORE_COMMENTS = [
  "That was really tricky! Keep practising — your brain is getting stronger! 💪",
  "Good try! Every riddle you think about makes your brain smarter! 🌱",
  "Nice work! You're getting better at spotting the clues! 🔍",
  "Great job! You're a riddle solver in the making! ⭐",
  "Amazing! You cracked almost all of them — you're so clever! 🏆",
  "Perfect score! You are a true riddle master! 🎉🏆",
]

export default function Riddle({ child, quota, featureConfig }) {
  const { track } = useTracker()
  const { markActive } = useFeatureDuration('riddle', track)
  const riddleStartTime = useRef(null)
  const offline = useOffline()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'

  const childAge  = child?.birthYear ? new Date().getFullYear() - child.birthYear : 5
  const band      = ageToBand(childAge)
  const childId   = child?.id

  const [riddles, setRiddles]         = useState(() => pickRiddles(childId, band))
  const [currentIdx, setCurrentIdx]   = useState(0)
  const [input, setInput]             = useState('')
  const [showHint, setShowHint]       = useState(false)
  const [wrongCount, setWrongCount]   = useState(false)
  const [score, setScore]             = useState(0)
  const [completed, setCompleted]     = useState(false)
  const [feedback, setFeedback]       = useState(null) // 'correct' | 'wrong' | 'revealed'
  const [showConfetti, setShowConfetti] = useState(false)
  const [glumbiPhase, setGlumbiPhase] = useState('intro') // 'intro' | 'answering' | 'reaction'
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const glumbiIntro = useRef(GLUMBI_INTROS[Math.floor(Math.random() * GLUMBI_INTROS.length)])

  const riddleAiEnabled = (() => {
    if (!featureConfig) return true
    const fc = featureConfig.find(f => f.featureName === 'riddle')
    return !fc || fc.enabled !== false
  })()

  const canGenerate = riddleAiEnabled && !offline && quota && quota.used < quota.limit
  const current     = riddles[currentIdx]

  async function handleGenerate() {
    if (!canGenerate) return
    setLoading(true)
    setError('')
    try {
      const result = await riddleApi.generate(child.id, child.name, childAge)
      track('riddle', 'generate')
      window.__glumbiRefreshQuota?.('riddle')
      riddleStartTime.current = Date.now()
      setRiddles(result.slice(0, 5))
      resetSession(result.slice(0, 5))
    } catch {
      setError('Could not load AI riddles — using your personalised offline set!')
      const fresh = pickRiddles(childId, band)
      resetSession(fresh)
    } finally {
      setLoading(false)
    }
  }

  function resetSession(newRiddles) {
    glumbiIntro.current = GLUMBI_INTROS[Math.floor(Math.random() * GLUMBI_INTROS.length)]
    setRiddles(newRiddles)
    setCurrentIdx(0)
    setInput('')
    setShowHint(false)
    setWrongCount(0)
    setScore(0)
    setCompleted(false)
    setFeedback(null)
    setGlumbiPhase('intro')
    riddleStartTime.current = Date.now()
  }

  function handlePlayAgain() {
    const fresh = pickRiddles(childId, band)
    resetSession(fresh)
    setError('')
  }

  function advanceOrComplete(earnedPoint) {
    const newScore = score + (earnedPoint ? 1 : 0)
    setScore(newScore)
    setGlumbiPhase('reaction')
    track('riddle', 'glumbi_riddle', { metadata: { result: earnedPoint ? 'correct' : 'revealed', riddle: current?.question } })
  }

  function handleNextRiddle() {
    if (currentIdx + 1 >= riddles.length) {
      setCompleted(true)
      track('riddle', 'complete', {
        metadata: { score: score, total: riddles.length },
        durationSeconds: riddleStartTime.current ? Math.round((Date.now() - riddleStartTime.current) / 1000) : null
      })
    } else {
      setCurrentIdx(i => i + 1)
      setInput('')
      setShowHint(false)
      setWrongCount(0)
      setFeedback(null)
      setGlumbiPhase('answering')
    }
  }

  function handleSubmit() {
    if (!input.trim() || feedback || glumbiPhase !== 'answering') return
    if (checkAnswer(input, current.answer)) {
      setFeedback('correct')
      setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000)
      track('riddle', 'correct', { metadata: { riddle: current.question, attempt: wrongCount + 1 } })
      advanceOrComplete(true)
    } else {
      const newWrong = wrongCount + 1
      setWrongCount(newWrong)
      if (newWrong >= 2) {
        setFeedback('revealed')
        track('riddle', 'revealed', { metadata: { riddle: current.question } })
        advanceOrComplete(false)
      } else {
        setFeedback('wrong')
        track('riddle', 'wrong', { metadata: { riddle: current.question, attempt: newWrong } })
        setTimeout(() => { setFeedback(null); setInput('') }, 1800)
      }
    }
  }

  function handleKeyDown(e) { if (e.key === 'Enter') handleSubmit() }

  const feedbackColor = feedback === 'correct' ? '#6bcb77' : feedback === 'wrong' ? '#ff6b6b' : feedback === 'revealed' ? '#ffa502' : null
  const finalScore    = score // at completion, advanceOrComplete has already incremented
  const scoreComment  = SCORE_COMMENTS[Math.min(finalScore, SCORE_COMMENTS.length - 1)]

  return (
    <div style={{ padding: isMobile ? '12px 12px 40px' : '16px 24px 40px', fontFamily: 'Nunito, sans-serif' }}>
      {showConfetti && <Confetti />}
      <FeatureBanner feature="riddle" child={child} isMobile={isMobile} />
      <QuotaBanner quota={quota} isMobile={isMobile} />

      {loading && <ThemeLoader theme={child?.theme} label="Crafting riddles just for you…" />}

      {error && (
        <div style={{ background: '#fff8e1', border: '1.5px solid #ffe082', borderRadius: 12, padding: '10px 16px', color: '#b8860b', fontSize: 14, marginBottom: 12, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {!completed ? (
        <>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {riddles.map((_, i) => (
              <div key={i} style={{
                width: 12, height: 12, borderRadius: '50%',
                background: i < currentIdx ? '#6bcb77' : i === currentIdx ? 'var(--primary)' : '#ddd',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {/* Glumbi intro phase */}
          {glumbiPhase === 'intro' && (
            <div style={{ background: 'var(--primary-lt)', borderRadius: 20, padding: isMobile ? '20px 18px' : '24px 28px', marginBottom: 16, textAlign: 'center', border: '2px solid var(--primary)', animation: 'fadeIn 0.4s ease' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🌟</div>
              <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: '#333', lineHeight: 1.6, marginBottom: 20 }}>
                {glumbiIntro.current}
              </div>
              <button onClick={() => { setGlumbiPhase('answering'); riddleStartTime.current = Date.now(); markActive() }}
                style={{ padding: '12px 28px', borderRadius: 50, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                Let's go! 🎯
              </button>
            </div>
          )}

          {/* Riddle card — answering phase */}
          {glumbiPhase === 'answering' && (
            <div style={{
              background: 'white', borderRadius: 20, padding: isMobile ? '24px 20px' : '32px 36px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: `2.5px solid ${feedbackColor || '#f0f0f0'}`,
              textAlign: 'center', marginBottom: 16, transition: 'border-color 0.3s', position: 'relative',
            }}>
              {feedback ? (
                <div style={{ fontSize: isMobile ? 56 : 72, marginBottom: 16, lineHeight: 1 }}>{current?.emoji}</div>
              ) : (
                <div style={{ fontSize: isMobile ? 56 : 72, marginBottom: 16, lineHeight: 1 }}>🤔</div>
              )}
              <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: '#333', lineHeight: 1.5, marginBottom: 20 }}>
                {current?.question}
              </div>

              {showHint && (
                <div style={{ background: '#fff8e1', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#b8860b', fontWeight: 700, marginBottom: 16 }}>
                  💡 Hint: {current?.hint}
                </div>
              )}

              {feedback === 'correct' && (
                <div style={{ fontSize: 28, marginBottom: 12, animation: 'popIn 0.4s ease' }}>⭐ Correct!</div>
              )}
              {feedback === 'wrong' && (
                <div style={{ fontSize: 18, color: '#ff6b6b', marginBottom: 12, fontWeight: 800 }}>❌ Try again!</div>
              )}
              {feedback === 'revealed' && (
                <div style={{ background: '#fff3cd', borderRadius: 12, padding: '10px 16px', fontSize: 15, color: '#856404', fontWeight: 800, marginBottom: 12 }}>
                  The answer was: <span style={{ color: '#333' }}>{current?.answer}</span>
                </div>
              )}

              {!feedback && (
                <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer…"
                    autoFocus
                    style={{
                      flex: 1, width: isMobile ? '100%' : 'auto', padding: '12px 16px', borderRadius: 50,
                      border: '2px solid #eee', fontSize: 15, fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button onClick={handleSubmit} style={{
                    padding: '12px 24px', borderRadius: 50, border: 'none',
                    background: 'linear-gradient(135deg,var(--primary),var(--accent))', color: 'white',
                    fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap',
                  }}>
                    Submit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Glumbi reaction phase */}
          {glumbiPhase === 'reaction' && current?.glumbiReaction && (
            <div style={{ background: 'var(--primary-lt)', borderRadius: 20, padding: isMobile ? '20px 18px' : '24px 28px', marginBottom: 16, border: '2px solid var(--primary)', animation: 'fadeIn 0.4s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>🌟</div>
                <div>
                  {feedback === 'correct' && <div style={{ fontSize: 13, fontWeight: 800, color: '#6bcb77', marginBottom: 4 }}>⭐ You got it!</div>}
                  {feedback === 'revealed' && <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>💡 The answer was: {current?.answer}</div>}
                  <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: '#333', lineHeight: 1.6 }}>
                    {current.glumbiReaction}
                  </div>
                </div>
              </div>
              {current?.glumbiTeaser && currentIdx < riddles.length - 1 && (
                <div style={{ fontSize: 13, color: '#666', fontWeight: 600, fontStyle: 'italic', marginBottom: 14, paddingLeft: 44 }}>
                  {current.glumbiTeaser}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <button onClick={handleNextRiddle}
                  style={{ padding: '12px 28px', borderRadius: 50, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                  {currentIdx + 1 >= riddles.length ? 'See my score! 🏆' : 'Next Riddle →'}
                </button>
              </div>
            </div>
          )}

          {/* Hint button */}
          {glumbiPhase === 'answering' && !showHint && !feedback && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <button onClick={() => { setShowHint(true); track('riddle', 'hint_used', { metadata: { riddle: current?.question } }) }}
                style={{ background: 'var(--primary-lt)', border: '2px solid var(--primary)', borderRadius: 50, padding: '8px 20px', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
                💡 Show Hint
              </button>
            </div>
          )}
        </>
      ) : (
        /* Completion screen */
        <div style={{ background: 'white', borderRadius: 20, padding: isMobile ? '28px 20px' : '40px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: score >= 4 ? 72 : 56, marginBottom: 12 }}>
            {score === 5 ? '🏆' : score >= 3 ? '⭐' : '🎯'}
          </div>
          <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: '#333', marginBottom: 8 }}>
            You got {score} out of {riddles.length}!
          </div>
          {/* Glumbi score comment */}
          <div style={{ background: 'var(--primary-lt)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🌟</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#333', lineHeight: 1.6 }}>{scoreComment}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handlePlayAgain}
              style={{ padding: '14px 28px', borderRadius: 50, border: '2px solid var(--primary)', background: 'var(--primary-lt)', color: 'var(--primary)', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
              🔄 More Riddles
            </button>
            {canGenerate && (
              <button onClick={handleGenerate} disabled={loading}
                style={{ padding: '14px 28px', borderRadius: 50, border: 'none', background: loading ? '#eee' : 'linear-gradient(135deg,var(--primary),var(--accent))', color: loading ? '#aaa' : 'white', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif', opacity: loading ? 0.6 : 1 }}>
                ✨ New AI Riddles (1 credit)
              </button>
            )}
          </div>
        </div>
      )}

      {/* AI button during game */}
      {!completed && glumbiPhase !== 'intro' && canGenerate && (
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button onClick={handleGenerate} disabled={loading}
            style={{ background: 'var(--primary-lt)', border: '2px solid var(--primary)', borderRadius: 50, padding: '8px 20px', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Nunito, sans-serif', opacity: loading ? 0.6 : 1 }}>
            ✨ Get New AI Riddles
          </button>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
