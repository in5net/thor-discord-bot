interface Icon {
  url: string;
  width: number;
  height: number;
}

interface Channel {
  id: string;
  name: string;
  verified: boolean;
  url: string;
  icon: Icon;
  subscribers?: number;
}
export default Channel;
