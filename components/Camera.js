import React, {PureComponent} from 'react';
import {RNCamera} from 'react-native-camera';

import {Icon} from 'react-native-material-ui';
import {TouchableOpacity, Alert, StyleSheet} from 'react-native';

import {getURL, uploadFile, runRekognition} from '../services/photo-services';
import AwesomeAlert from 'react-native-awesome-alerts';

export default class Camera extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      takingPic: false,
      showAlert: false,
      alertMessage: '',
      alertTitle: 'Analyzing...',
    };
  }

  takePicture = async () => {
    if (this.camera && !this.state.takingPic) {
      let options = {
        quality: 0.85,
        fixOrientation: true,
        forceUpOrientation: true,
      };

      this.setState({takingPic: true, showAlert: true});
      const data = await this.camera.takePictureAsync(options);

      let fileNameSplit = data.uri.split('/');
      let fileName = fileNameSplit[fileNameSplit.length - 1];
      getURL(fileName).then((res) => {
        uploadFile(res, data).then(() => {
          runRekognition(fileName)
            .then((res) => {
              this.setState({
                takingPic: false,
                alertTitle: 'Food Match Found!',
                alertMessage: res.data === true ? 'Hotdog' : 'Not Hotdog',
                // showAlert: true,
              });
              // Alert.alert(res.data === true ? 'Hotdog' : 'Not Hotdog');
            })
            .catch((err) => {
              this.setState({takingPic: false});
              console.log('rekognition error:', err);
            });
        });
      });
    }
  };

  dismissAlert = () => {
    this.setState({
      alertMessage: '',
      alertTitle: 'Analyzing...',
      showAlert: false,
    });
  };

  render() {
    const {showAlert, alertMessage, alertTitle, takingPic} = this.state;
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
        <AwesomeAlert
          show={showAlert}
          showProgress={takingPic}
          title={alertTitle}
          message={alertMessage}
          closeOnTouchOutside={!takingPic}
          closeOnHardwareBackPress={!takingPic}
          showConfirmButton={!takingPic}
          confirmText="Thanks!"
          confirmButtonColor="#DD6B55"
          onDismiss={this.dismissAlert}
          onConfirmPressed={this.dismissAlert}
          messageStyle={styles.alertMessage}
        />
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
  alertMessage: {
    fontSize: 32
  }
});
