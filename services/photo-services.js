import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import environment from '../environments';


export const getURL = async (fileName) => {
  let headers = {};
  headers['x-api-key'] = environment.REACT_APP_API_KEY;
  let url = environment.REACT_APP_GET_URL;
  return await axios
    .post(url, {fileName}, {headers})
    .then((res) => {
      return res.data.body.url;
    })
    .catch((err) => {
      Alert.alert('get url error:', err);
    });
};

export const uploadFile = async (url, file) => {
  const filePath = file.uri.split(':')[1].substring(2);
  let headers = {};
  headers['Content-type'] = 'multipart/form-data';

  return await RNFetchBlob.fetch(
    'PUT',
    url,
    headers,
    RNFetchBlob.wrap(filePath),
  )
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw err
    });
};

export const runRekognition = (fileName) => {
  let headers = {};
  headers['x-api-key'] = environment.REACT_APP_API_KEY;
  let url = environment.REACT_APP_REKOGNITION;
  return axios.get(`${url}=${fileName}`, {headers});
};
