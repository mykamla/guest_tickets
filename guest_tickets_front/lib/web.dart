import 'dart:async';
//import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
//import 'package:path_provider/path_provider.dart';
//import 'dart:html' as html;
import 'package:universal_html/html.dart' as html;

class WebPAge extends StatefulWidget {
  @override
  _WebPAgeState createState() => _WebPAgeState();
}

class _WebPAgeState extends State<WebPAge> {
  FilePickerResult? _files;
  Dio _dio = Dio();
  bool _isDownloading = false;
  bool _isDownloading2 = false;
  bool success = false;

  Future<void> _selectFiles() async {
    try {
      FilePickerResult? files = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );

      if (files != null) {
        setState(() {
          _files = files;
          //List<File> files = result.paths.map((path) => File(path)).toList();
        });
      }
    } on PlatformException catch (e) {
      print("Erreur lors de la sélection des fichiers : $e");
    }
  }

  Future<void> _startDownload() async {
    setState(() {
      _isDownloading2 = true;
    });

    try {
      /*
      await _dio.download(
        'http://localhost:3000/zip',
        '${(await getTemporaryDirectory()).path}tickets.zip',
      );
      */

      //html.AnchorElement anchorElement = new html.AnchorElement(href: 'http://localhost:3000/zip');
      //anchorElement.download = 'http://localhost:3000/zip';
      //anchorElement.click();
      html.window.open('https://apiv.mykamla.com/zip', 'tickets.zip');

      setState(() {
        _isDownloading2 = false;
      });
    } catch (e) {}
  }

  Future<void> _startUpload() async {
    setState(() {
      _isDownloading = true;
    });

    try {
      List dat = [];
      for (var i = 0; i < _files!.count; i++) {
        dat.add(await MultipartFile.fromBytes(
            _files!.files[i].bytes as List<int>,
            filename: _files!.files[i].name));
      }

      final formData = FormData.fromMap({'files': dat});

      var o = await _dio
          .post('https://apiv.mykamla.com/download', data: formData)
          .whenComplete(() => setState(() {
                success = true;
              }));

      print("o@@@@@@@@@@@@@@@@@@@@@@@@");
      print(o);
    } catch (e) {
      print('Erreur lors du téléchargement : $e');
    }

    setState(() {
      _isDownloading = false;
    });

    showD(success);
  }

  showD(success) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          //title: Text('Téléchargement terminé'),
          content: Text(success
              ? 'Les fichiers ont été chargés avec succès !\nAttendez le télécharment du Zip'
              : 'ECHEC'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('OK'),
            ),
          ],
        );
      },
    );
  }

  bool downloadingZip = false;

  Future<void> _upAndDown() async {
    await _startUpload().whenComplete(() {

setState(() {
      downloadingZip = true;
    });

    Timer(Duration(seconds: 15), () {
      _startDownload().whenComplete(() =>
      setState(() {downloadingZip = false;})
      );
      });

    }
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
          Text('Verified'),
        downloadingZip
        ?   Row(
                  children: [
                    Text('Préparation'),
                    SizedBox(
                      width: 5,
                    ),
                    CircularProgressIndicator(color: Colors.white),
                  ],
                )
        
        : SizedBox()
        
        
        ]),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            ElevatedButton(
              onPressed: _selectFiles,
              child: const Text('Sélectionner des fichiers'),
            ),
            const SizedBox(height: 20),
            if (_files != null)
              ElevatedButton(
                onPressed: _isDownloading ? null : _upAndDown,
                child: const Text('Commencer le traitement'),
              ),
            const SizedBox(height: 20),
            if (_isDownloading)
              const CircularProgressIndicator()
            else if (_files != null)
              Text('${_files!.count} fichier(s) sélectionné(s)'),
          ],
        ),
      ),
    );
  }
}
