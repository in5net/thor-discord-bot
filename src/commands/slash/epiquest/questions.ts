import items, { type Item } from "./items";
import { type Response } from "./types";
import { remove } from "@iz7n/std/array";
import { choice, choices } from "@iz7n/std/random";

interface Answer {
  text: string | (() => string);
  emoji: string;
  response?: Response;
  effect?: "good" | "bad";
  end?: boolean;
}

/**
 * {title}: the title prefix
 * {item}: the name of the item you are trying to obtain
 * {random}: random word from yyyyyyy.info
 */
const questions: Array<{
  text: string | ((inventory: string[]) => string);
  answers: Answer[];
}> = [
  // Opening
  {
    text: "You wake up one day in an empty room, wondering- Is your name harold?",
    answers: [
      { text: "Not unless it isn’tn’t", emoji: "🤔" },
      {
        text: "Only if you make me a sandwich",
        emoji: "🍔",
        response: "Ok, you’re a sandwich",
      },
      {
        text: "Nah, that’s my cousin’s dog’s owner’s father’s sister’s nephew’s name",
        emoji: "👨‍👩‍👧‍👦",
      },
    ],
  },
  {
    text: "You exist.",
    answers: [
      { text: "Ok", emoji: "👍" },
      {
        text: "Yeah, what about it?",
        emoji: "🍔",
        response: "I didn’t mean nothing by it, carry on",
      },
      { text: "Option 3", emoji: "🗿" },
    ],
  },
  {
    text: "*Epiquest opening theme plays*",
    answers: [
      {
        text: "No it didn’t",
        emoji: "👎",
        response: "Yeah, it did, you just couldn’t hear it",
      },
      {
        text: "I like the letter 4",
        emoji: "4️⃣",
        response: "The answer is sick dogs",
      },
      { text: "*Remain silent*", emoji: "🔇" },
      { text: "*Hum along*", emoji: "🎵" },
    ],
  },
  {
    text: "What… What ARE you?",
    answers: [
      { text: "The grundelbusker", emoji: "😎", end: true },
      { text: "Your worst nightmare", emoji: "😳", response: "NOOOOOoooooo" },
      { text: "Franz ferdinand", emoji: "🤡", response: "Oh, cool." },
    ],
  },
  {
    text: "Question.",
    answers: [
      { text: "Yes please", emoji: "👾", response: "You’re welcome?" },
      { text: "WHAT????", emoji: "😅", response: "Huh?" },
      { text: "Huh?", emoji: "🙋", response: "WHAT????" },
      { text: "No Thx", emoji: "👎", response: "Too bad." },
    ],
  },
  {
    text: "Welcome to the {title}titled Epiquest! Number 7!",
    answers: [
      {
        text: "Yeah 7 is a cool number, I agree",
        emoji: "7️⃣",
        response: "I never said that, but I suppose it is",
      },
      {
        text: "UH YOU ALREWADY WELCOMRED MEE??!",
        emoji: "👥",
        response: "TO BAD!!!111!!!! HARUBLE!",
      },
      {
        text: "Give me a bird",
        emoji: "🦜",
        response(inventory) {
          inventory.push("bird");
          return "You got a bird! (Get a bird)";
        },
      },
      {
        text: "You’re welcome",
        emoji: "✅",
        response: "Thank y- wait a sec..",
      },
    ],
  },
  {
    text: "WHaT iZ Ur NaMe?",
    answers: [
      {
        text: "Zampopulus",
        emoji: "🚢",
        response: "Welcome aboard, commander.",
      },
      {
        text: "IM A NUKE",
        emoji: "💣",
        response: "Well, that’s too bad for yooooouu",
      },
      { text: "I’m That Guy/Person/cr3ature", emoji: "💧", response: "awawa" },
    ],
  },
  // Intermediary
  {
    text: "The {item} is falling to the ground in slow motion!",
    answers: [
      {
        text: "NooOOOOoooOOOoO0Oooo (Slow motion dive)",
        emoji: "💢",
        response:
          "You dramatically dive and catch the {item}. You could star in slow motion action movies!",
        effect: "good",
      },
      {
        text: "Generate chunks to save it!",
        emoji: "📦",
        response(inventory) {
          inventory.push("chunks");
          return "The chunk generation takes too long, and the {item} falls to the ground.. Might as well use these later- (You got chunks)";
        },
        effect: "bad",
      },
      {
        text: "Is THat A cOOKIE?",
        emoji: "🍪",
        response:
          "You spotted a cookie! Congrats! (You got nothing because you were quickly swept away to the next question)",
        effect: "bad",
      },
      {
        text: "PANIC",
        emoji: "😳",
        response:
          "You panic, Flailing aboutt nonsensically. The {item} shakes it head at the sight and leaves.",
      },
    ],
  },
  {
    text: "VSM UPI RBRM IMFRTDYSMF YJOD?",
    answers: [
      {
        text: "URD",
        emoji: "🤔",
        response(inventory) {
          inventory.push("hair dryer");
          return "UPI HPY S JSOT FTURT (You got a hair dryer)";
        },
      },
      {
        text: "MPP",
        emoji: "💿",
      },
      {
        text: "OMVPTTRVY SMDERT",
        emoji: "🧲",
        effect: "bad",
      },
      {
        text: "DYP{ UR::OMH",
        emoji: "🧿",
        response: "pl.",
      },
    ],
  },
  {
    text: "A Rap salesman has the {item}! Throw down some beats!",
    answers: [
      {
        text: "OO OOWAH DAH DOO",
        emoji: "🤔",
        response(inventory) {
          inventory.push("country haven XVV");
          return "“Yo is that the theme song to country haven XVV? You’re cool, so you can have my copy.” (Got country haven XVV)";
        },
      },
      {
        text: "So I walkin down the street and I greet the {item} pretty neet",
        emoji: "✋",
        response: "“Bro, that’s like, not cool, dude.”",
        effect: "bad",
      },
      {
        text: "Knit them a sweater with a picture of a naval fleet",
        emoji: "🌊",
        response: "“That’s like, totally radical on all levels, man!”",
      },
      {
        text: "Hey look it’s my cousin’s dog’s owner’s father’s sister’s nephew, harold!",
        emoji: "🐶",
        response:
          "“Oh hey, man! I didn’t recognise you at first! How bout we jam before you head out?”",
        effect: "good",
      },
    ],
  },
  {
    text: "The {item} is armed and dangerous! Get down!",
    answers: [
      {
        text: "Walk up to it and teach it a lesson",
        emoji: "✏️",
        response:
          "You try to walk up to it to teach it a lesson, but the {item} already has a private mentor! What a twist!",
        effect: "bad",
      },
      {
        text: "GET DOWN!",
        emoji: "⬇️",
        response: "You get down, and the {item} escapes! Onwards!",
      },
      {
        text: "Use your trusty tool belt!",
        emoji: "🛠",
        response(inventory) {
          const item = choice(inventory);
          if (!item) {
            return {
              text: "The tool belt has nothing on it, so you just stand there…",
              effect: "bad",
            };
          }
          const index = inventory.indexOf(item);
          inventory.splice(index, 1);
          return {
            text: `You use the ${item} to seriously clobber the {item}! You hum an victory fanfare afterwards. (consumes the random item)`,
            effect: "good",
          };
        },
      },
      {
        text: "Pull out your trusty blast’i’mo’ rifle and surround it",
        emoji: "🔫",
        response(inventory) {
          inventory.push("‘probably tea’");
          return "Oh ye, now this is the stuff! You have a friendly blast’i’mo’ duel with the {item}, and afterwards, you go out for tea! (got ‘probably tea’)";
        },
      },
      {
        text: "Think about your future with that {item}, and try to talk it down",
        emoji: "⏱",
        response(inventory) {
          inventory.push("emotional baggage");
          return `As soon as you start talking, the {item} tells you to remember {random}. The two of you have an emotional moment reminiscing about {random}. Afterwards, you go your separate ways, ${choice(
            ["dreading", "looking foreward to", "ready for"],
          )} your next encounter. (You got emotional baggage)`;
        },
      },
    ],
  },
  {
    text: "You get caught in possession of the {item} by border patrol! They want to confiscate it! Think fast!",
    answers: [
      {
        text: "Play dead",
        emoji: "💀",
        response(inventory) {
          inventory.push("garbage");
          return "You play dead, and it works! They take you outside and put you in a dumpster. Later, you realise They took the {item}! Oh hey, some garbage!";
        },
      },
      {
        text: "Give ‘em the ol’ one two!!",
        emoji: "2️⃣",
        response:
          "You give ‘em the one two, and they give you the ol’ one two three four five six seven… Ouch…",
        effect: "bad",
      },
      {
        text: "Hand it over.. Not much else you can do..",
        emoji: "🤌",
        response(inventory) {
          inventory.push("butter cookie");
          return "You hand it over and after awhile they clear your departure, giving back the gem! On the way out, they give you a complimentary butter cookie!";
        },
      },
      {
        text: () =>
          `You’ll never catch me coppers! I’m off to ${choice([
            "Pennsylvania, where the going is great!",
            "Omaha, you won’t find me there!",
            "I’ll escape from you no matter the place!",
          ])}`,
        emoji: "🖊",
        response:
          "You quickly skedaddle, eventually evading any eager pursuers.",
      },
    ],
  },
  {
    text: "You find yourself in an elevator alone with the {item}. The silence begins to get awkward, you think you should probably say something…",
    answers: [
      {
        text: "*Stay silent*",
        emoji: "🤫",
        response:
          "The silence grows more and more awkward, the air seems extremely hot as you begin to sweat. Eventually, after what seems like hours, the elevator ride ends and the two of you remain silent, continuing your journey…",
        effect: "bad",
      },
      {
        text: "Try to explain breadstick theory to the {item}",
        emoji: "🥖",
        response(inventory) {
          inventory.push("breadstick");
          return "You begin to explain breadstick theory to the {item}, after a couple hours you realize it can’t understand you because it’s just a {item}. You sit in silence until the elevator doors open. In front of you is a breadstick. What are the odds?";
        },
      },
      {
        text: "Make small talk",
        emoji: "🔻",
        response:
          "You try to make small talk, but there isn’t anything to talk about. Stuttering, you eventually stop trying to converse. At least you tried...",
      },
      {
        text: "Confess feelings",
        emoji: "🤢",
        response(inventory) {
          inventory.push("moon flower");
          return "After about an hour of silence, you work up the courage to confess your feelings for the {item}. It seems surprised, but it says it never knew, and it feels the same way. After the elevator ride, you walk together under the cool light of the moon, happy.";
        },
        effect: "good",
      },
      {
        text: "Start jumping up and down",
        emoji: "😬",
        response(inventory) {
          inventory.push("elevator railing");
          return "You begin jumping up and down, and eventually hit your head on the ceiling. The railing clatters off the side of the elevator wall.";
        },
      },
    ],
  },
  {
    text: "It's",
    answers: [
      {
        text: "Nothin’",
        emoji: "😤",
        response: "Could be Nerf, but ok.",
        effect: "good",
      },
      {
        text: "Nerf",
        emoji: "🔫",
        response() {
          const letters = ["e", "r", "f"];
          return `Could be nothin’, but okay. N${choices(letters, 3).join("")} gun)`;
        },
      },
      {
        text: "A thing that happened in Tiananmen Square 1989",
        emoji: "🇨🇳",
        response: "Uhh...nothing happened in Tiananmen Square during 1989.",
        effect: "bad",
      },
      {
        text: "Mongo",
        emoji: "🥭",
        response: "Unfortunately, Mongo is gone. (Got memory of Mongo)",
      },
    ],
  },
  {
    text: "What beats paper?",
    answers: [
      { text: "Rock", emoji: "🪨", response: "No, just no.", effect: "bad" },
      { text: "Scissors", emoji: "✂️", response: "Yeah, sure, I guess." },
      {
        text: "The Dwayne the Rock the Johnson",
        emoji: "🗿",
        response(inventory) {
          inventory.push("the Rock");
          return "Of course, the Rock is now on your side. (you got the Rock)";
        },
        effect: "good",
      },
      {
        text: "Paper++",
        emoji: "📄",
        response(inventory) {
          inventory.push("paper++");
          return "(you got paper++)";
        },
      },
    ],
  },
  {
    text: inventory =>
      `You${
        inventory.includes("the Rock") ?
          " and the Dwayne the Rock the Johnson"
        : ""
      } witness the {item} go to a museum, looking for something. You enter the museum and can’t find the {item}, but do see some printer paper.`,
    answers: [
      {
        text: "Eat the paper",
        emoji: "👴",
        response:
          "You have the sudden urge to consume the paper, and swallow it whole. You don’t think its good for you, must have been some low quality ink...",
        effect: "bad",
      },
      {
        text: "Search for “paper” on the app store",
        emoji: "🔍",
        response:
          "You look for an app called “paper”, but are distracted by “Geometry Joyride” on your phone.",
      },
      {
        text: "Steal the paper",
        emoji: "🤖",
        response(inventory) {
          inventory.push("mysterious paper");
          return "You distract the museum guards with a bo'ohw'o'wo'er and steal the paper (got mysterious paper)";
        },
      },
      {
        text: "Combine it with paper++",
        emoji: "🧪",
        response(inventory) {
          inventory.push("mango dragon fruit drink");
          return "Nothing happens, but hey, starbucks finally has mango dragon fruit for ONCE. Okay, I know some people will say things like “it's just a drink” and “starbucks has plenty of other things”, BUT WHAT ELSE AM I GONNA GET. What?! some gross green tea or dirty bean water, GROSS!!1!11! On top of all that, IT’s ALWAYS OuT OF SToCK. YOU EXPECT ME TO BE CALM NOW, HUH BUB??!!!11/1?!? I’M SICK OF ALL THIS DISRESPECT THAT I GET FROM STARBUCKS 24/7 CAUSE THEIR ALL LICK “oh you LIEK MAGO DRAGNO FRUIT, WELL YUO CANT HAVE IT”. CRY ABT IT CRY CRY ABUOT IT. HUH….huh…...almost passed out. Well anyway you finally get mango dragon fruit drink.";
        },
      },
    ],
  },
  // Mid
  {
    text: "Wait… Do you even remember what you’re trying to get?",
    answers: [
      {
        text: "Elixer",
        emoji: "🧪",
        response(inventory) {
          for (let i = 0; i < 2; i++) {
            const item = choice(inventory);
            remove(inventory, item);
          }

          return "Well, then you don’t deserve THESE!!";
        },
      },
      ...items.map(({ name, emoji }) => ({
        text: name,
        emoji,
        response(inventory: string[], item: Item) {
          if (name === item.name) {
            return "You have the memory of a goodfish! Congrats!";
          }
          for (let i = 0; i < 2; i++) {
            const item = choice(inventory);
            remove(inventory, item);
          }

          return "Well, then you don’t deserve THESE!!";
        },
      })),
      {
        text: "No….",
        emoji: "❌",
        response(inventory) {
          const item = choice(inventory);
          remove(inventory, item);
          return "Well, at least you’re honest.";
        },
      },
    ],
  },
];
export default questions;
