export function parse(source: string) {
  const lines = source.trim().split("\n").filter(Boolean);
  const sections: Record<string, string[]> = {};
  let sectionName: string | undefined;
  for (const line of lines) {
    if (line.startsWith("***")) sectionName = line.split(" ").pop();
    else if (sectionName) {
      let section = sections[sectionName];
      if (!section) section = sections[sectionName] = [];
      section.push(line);
    }
  }

  sections.br = ["\n"];
  return sections;
}
