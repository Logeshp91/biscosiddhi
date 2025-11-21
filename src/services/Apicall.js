// // Apicall.js
// import axios from 'axios';
// import { postAccessRead } from '../redux/action';
// import CookieManager from '@react-native-cookies/cookies';


// export const baseUrl = "https://testserver.biztechnovations.com";
// // export const baseUrl = "https://devserver.biztechnovations.com";
// export const endPoint = {
//     postauthendication: '/web/session/authenticate',
//     postcreatevisit: '/web/dataset/call_kw',
//     postAccessRead:'/api/visit/verified',
//     postconvert:"/api/visit/convert"
// };
// const headers = {
//     'Content-Type': 'application/json',
//     'Accept': '*/*'
// };

// export const ApiMethod = {
//     POST: async (url, data) => {
//         const cookies = await CookieManager.get(baseUrl);

//         return axios.post(baseUrl + url, data, {
//             headers: {
//                 ...headers,
//                 Cookie: cookies?.session_id ? `session_id=${cookies.session_id}` : ''
//             },
//             withCredentials: true
//         });
//     }
// };

import axios from 'axios'; 
export const baseUrl = "https://testserver.biztechnovations.com"; 
// export const baseUrl = "https://devserver.biztechnovations.com";
// export const baseUrl = "https://siddhi.biscogroup.com";
 export const endPoint = {
 postauthendication: '/web/session/authenticate', 
postcreatevisit: '/web/dataset/call_kw', 
postAccessRead:'/api/visit/verified', 
postconvert:"/api/visit/convert",
postOutstanding:'/web/dataset/call_kw' ,
postCustomerList:'/web/dataset/call_kw'

}; const headers = {
 'Content-Type': 
'application/json',
 'Accept': '*/*' 
}; export const ApiMethod = { POST: (url, data) => { return axios.post(baseUrl + url, data, { headers: headers, withCredentials: true }); } };