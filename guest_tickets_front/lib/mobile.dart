import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:dio/dio.dart';

class MobilePage extends StatefulWidget {
  @override
  _MobilePageState createState() => _MobilePageState();
}

class _MobilePageState extends State<MobilePage> {
  final GlobalKey qrKey = GlobalKey(debugLabel: "QR");
  QRViewController? controller;
  String result = "";
  Dio _dio = Dio();

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      setState(() {
        result = scanData.code!;
      });
    });
  }

  Future<Map<String, dynamic>> _check({String? code = ''}) async {
    setState(() {});

    Map<String, dynamic> map = {};

    try {
      Response res = await _dio
          .post('https://apiv.mykamla.com/verify', data: {'code': code});
      map = res.data;
    } catch (e) {
      map['error'] = 'true';
      print('Erreur lors du check : $e');
    }

    return map;
  }

  bool? isFlash = false;
  Future<void> onOffLight() async {
    await controller?.toggleFlash();
    await controller?.getFlashStatus().then((value) => setState(() {
          isFlash = value;
        }));
  }

  @override
  Widget build(BuildContext context) {
    Color btn = Colors.white;
    return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.orangeAccent,
          title: Center(child: Text("Fabiola & Joel")),
        ),
        body: FutureBuilder(
          initialData: {},
          future: _check(code: result),
          builder: (BuildContext context, AsyncSnapshot<dynamic> snapshot) {
            String name = '';
            String table = '';
            String message = '';
            bool exist;

            if (snapshot.hasData && snapshot.data != {}) {
              if (snapshot.data['exist'] == true) {
                exist = true;
                name = snapshot.data['name'];
                table = snapshot.data['table'];
                message = snapshot.data['message'];
                btn = Colors.green;
              } else {
                exist = false;
              }
            } else {
              exist = false;
              message = 'Le système rencontre une erreur, veillez reéssayer';
              btn = Colors.white;
            }
            return Column(
              children: [
                Expanded(
                  flex: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: ElevatedButton(
                            style:
                                ElevatedButton.styleFrom(backgroundColor: btn),
                            onPressed: () {},
                            child: RotationTransition(
                                turns: new AlwaysStoppedAnimation(180 / 360),
                                child: Text(
                                  name,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ))),
                      ),
                      SizedBox(
                        width: 50,
                      ),
                      Flexible(
                        child: ElevatedButton(
                            style:
                                ElevatedButton.styleFrom(backgroundColor: btn),
                            onPressed: () {},
                            child: RotationTransition(
                                turns: new AlwaysStoppedAnimation(180 / 360),
                                child: Text(
                                  table,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ))),
                      ),
                    ],
                  ),
                ),
                Expanded(
                    flex: 2,
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Center(
                          child: RotationTransition(
                        turns: new AlwaysStoppedAnimation(180 / 360),
                        child: Text(
                          message,
                          textAlign: TextAlign.justify,
                          style: TextStyle(
                              fontSize: 20, fontWeight: FontWeight.w500),
                        ),
                      )),
                    )),
                Expanded(
                  flex: 3,
                  child: Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      QRView(key: qrKey, onQRViewCreated: _onQRViewCreated),
                      IconButton(
                          onPressed: () {
                            onOffLight();
                          },
                          icon: isFlash!
                              ? Icon(
                                  Icons.flash_off,
                                  color: Colors.white,
                                )
                              : Icon(Icons.flash_on, color: Colors.white)),
                    ],
                  ),
                ),
                Expanded(
                    flex: 1,
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Center(
                        child: Text(
                          message,
                          textAlign: TextAlign.justify,
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w500),
                        ),
                      ),
                    )),
                Expanded(
                  flex: 1,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: ElevatedButton(
                            style:
                                ElevatedButton.styleFrom(backgroundColor: btn),
                            onPressed: () {},
                            child: Text(
                              name,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            )),
                      ),
                      SizedBox(
                        width: 50,
                      ),
                      Flexible(
                        child: ElevatedButton(
                            style:
                                ElevatedButton.styleFrom(backgroundColor: btn),
                            onPressed: () {},
                            child: Text(
                              table,
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            )),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  flex: 1,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.orangeAccent),
                            onPressed: () {
                              setState(() {
                                result = '';
                                message = '';
                                name = '';
                                table = '';
                                exist = false;
                                btn = Colors.white;
                              });
                            },
                            child: Icon(Icons.refresh)),
                      ),
                    ],
                  ),
                ),
              ],
            );
          },
        ));
  }
}
