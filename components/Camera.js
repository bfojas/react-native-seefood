import React, {PureComponent} from 'react';
import {RNCamera} from 'react-native-camera';

import Icon from 'react-native-vector-icons/dist/FontAwesome';
import {TouchableOpacity, Alert, StyleSheet} from 'react-native';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';

import environment from '../environments';

export default class Camera extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      takingPic: false,
    };
  }

  getURL = async (fileName) => {
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

  uploadFile = async (url, file) => {
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
        Alert.alert('upload error:', JSON.stringify(err));
      });
  };

  runRekognition = (fileName) => {
    let headers = {};
    headers['x-api-key'] = environment.REACT_APP_API_KEY;
    let url = environment.REACT_APP_REKOGNITION;
    axios
      .get(`${url}=${fileName}`, {headers})
      .then((res) => {
        this.setState({takingPic: false});
        Alert.alert(res.data === true ? 'Hotdog' : 'Not Hotdog');
      })
      .catch((err) => {
        this.setState({takingPic: false});
        console.log('rekognition error:', err);
      });
  };

  takePicture = async () => {
    if (this.camera && !this.state.takingPic) {
      let options = {
        quality: 0.85,
        fixOrientation: true,
        forceUpOrientation: true,
      };

      this.setState({takingPic: true});
      const data = await this.camera.takePictureAsync(options);

      let fileNameSplit = data.uri.split('/');
      let fileName = fileNameSplit[fileNameSplit.length - 1];
      this.getURL(fileName).then((res) => {
        this.uploadFile(res, data).then(() => {
          this.runRekognition(fileName);
        });
      });
    }
  };

  render() {
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        captureAudio={false}
        style={{flex: 1}}
        type={RNCamera.Constants.Type.back}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.btnAlignment}
          onPress={this.takePicture}>
          <Icon name="camera" size={50} color="#fff" />
        </TouchableOpacity>
      </RNCamera>
    );
  }
}

const styles = StyleSheet.create({
  btnAlignment: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
  },
});
