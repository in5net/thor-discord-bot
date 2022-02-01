import axios from 'axios';

const url = 'https://api.github.com/zen';

axios.get<string>(url).then(response => console.log(response.data));
