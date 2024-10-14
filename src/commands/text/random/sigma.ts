import { choice } from "@in5net/std/random";
import command from "$lib/discord/commands/text";

const voicelines = [
  "Actuating the barrier!",
  "Barrier initialized!",
  "The barrier appears!",
  "Collapsing the barrier!",
  "Return to me!",
  "Withdrawing the barrier!",
  "The barrier endures assault!",
  "The barrier is sustaining damage!",
  "The enemy attacks the barrier!",
  "Barrier is nearly spent!",
  "Barrier is splintering!",
  "The barrier cannot withstand much more!",
  "The barrier is weakened!",
  "Barrier unsuccessful!",
  "Barrier has been overwhelmed!",
  "My barrier is gone!",
  "The barrier has fallen!",
  "Hold it together, hold it together...!",
  "I... I need to think!",
  "It's wrong... it's all wrong!",
  "Mass, velocity... no, no, no!",
  "What is it... what is it?",
  "Reach for the stars!",
  "A dragonic anomaly!",
  "The void of space is colder, still.",
  "The storm has been weathered.",
  "You see but a fraction of the universe!",
  "Out of time, once again.",
  "I have harnessed the harness.",
  "The power of attraction!",
  "Het universum zingt voor mij!",
  "What is that melody?",
];

export default command(
  {
    desc: "Sends a random Sigma voiceline",
    args: {},
  },
  () => choice(voicelines),
);
