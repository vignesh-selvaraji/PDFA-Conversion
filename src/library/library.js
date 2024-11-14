'use strict'
const { app } = require('electron')
const path = require('path');
const FS = require('fs');
const ElectronStore = require('electron-store');
const store = new ElectronStore();
const child_process = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const gs = require('ghostscript4js');
const imgToPDF = require('image-to-pdf');
const sizeOf = require('image-size');
const Jimp = require("jimp");
//
// g_main_window_id
//
let g_main_window_id = null;
module.exports.bind_main_window_id_to_library = function (id) {
  g_main_window_id = id;
}
//
//
//
let g_main_window = null;
module.exports.bind_main_window_to_library = function (mainwin) {
  g_main_window = mainwin;
}

module.exports.get_language = function () {
  let language = store.get('language');
  if (typeof (language) === "undefined" || language === null) {
    language = "日本語";
    store.set('language', language);
  }
  return language;
}
module.exports.CheckPDFAfile = async function (arg) {
  let inputfilename = path.basename(arg.filepath);
  const inputfileExtension = path.extname(inputfilename);
  if (inputfileExtension !== '.pdf') {
    return false;
  }
  else {
    try {
      let dataBuffer = FS.readFileSync(arg.filepath);
      const fileContent = dataBuffer.toString('utf-8').toLowerCase();
      if (fileContent.includes('pdfaid:conformance') || fileContent.includes('pdfaid:part')) {
        let targetPath = path.join(arg.targetFolder, inputfilename);
        FS.copyFileSync(arg.filepath, targetPath);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error reading PDF file:', error);
      return false;
    }
  }
}
//
// PDF/A File conversion using SKYPDF

// PDF/A File conversion without using Ghostscript
//
module.exports.pdfafileconversionusingGhostScript = async function (arg) {
  try {
    let inputpath = arg.params.filepath;
    let outputpath = arg.params.outputpath;
    let inputfilename = path.basename(inputpath);
    let filenameWithoutExtension = path.basename(inputfilename, path.extname(inputfilename));
    const platform = process.platform === 'win32' ? (process.arch === 'x64' ? 'gswin64c' : 'gswin32c') : process.platform === 'darwin' ? 'gs' : 'gs';
    let intermediatePdfPath;
    let outputfilename;

    if (path.extname(inputfilename) == '.pdf') {
      intermediatePdfPath = inputpath;
      outputfilename = filenameWithoutExtension + path.extname(inputfilename);
      outputpath = path.join(outputpath, outputfilename);
    }
    else {
      try {
        let Convertedfilename = filenameWithoutExtension + "-converted.pdf";
        let TempPath = outputpath;
        outputpath = path.join(outputpath, (filenameWithoutExtension + '.pdf'));
        intermediatePdfPath = path.join(TempPath, Convertedfilename);
        const dimensions = sizeOf(inputpath);
        const FileExtntion = path.extname(inputfilename).toLowerCase();

        if (FileExtntion == '.png' || FileExtntion == '.jpeg' || FileExtntion == '.jpg' || FileExtntion === '.tiff' || FileExtntion === '.tif' || FileExtntion === '.bmp') {
          // Tiff => png
          if (FileExtntion === '.tiff' || FileExtntion === '.tif' || FileExtntion === '.bmp') {
            function convertTiff(inputpath, outputPath) {
              return new Promise(async (resolve, reject) => {
                await Jimp.read(inputpath)
                  .then(image => {
                    return image.writeAsync(outputPath);
                  })
                  .then(() => {
                    console.log('Image written successfully');
                    resolve();
                  })
                  .catch(err => {
                    console.error('Error during conversion', err);
                    reject(err);
                  });
              });
            }

            await convertTiff(inputpath, path.join(arg.params.outputpath, 'output.png'))
              .then(() => {
                inputpath = path.join(arg.params.outputpath, 'output.png')
                console.log('Process completed');
              })
              .catch(err => {
                console.error('Final catch: Conversion process failed', err);
              });
          }

          // png, jpg, jpeg =>  pdf
          await new Promise(async (resolve, reject) => {
            const pages = [inputpath];
            const stream = imgToPDF(pages, [dimensions.width, dimensions.height]).pipe(FS.createWriteStream(intermediatePdfPath));

            stream.on('finish', () => {
              resolve();
            });

            stream.on('error', (err) => {
              console.log("error", err);
              reject(err);
            });
          });
        }
      }
      catch (err) {
        console.log("error", err);
        return err;
      }
    }

    const version = gs.version()
    console.log(version);
    await gs.executeSync([
      platform,
      '-dNOPAUSE',
      '-dBATCH',
      '-sDEVICE=pdfwrite',
      '-dPDFA=' + arg.params.pdflevel,
      '-dPDFACompatibilityPolicy=1',
      '-sProcessColorModel=DeviceRGB',
      '-sOutputFile=' + outputpath,
      intermediatePdfPath,
    ]);
    console.log("PDF/A Converted");
    return "Success";

  } catch (err) {
    console.log("error", err);
    return err;
  }
}

module.exports.createdirectorywithtimestamp = async function (dir1, dir2, filepath) {
  try {
    let directory = "";
    directory = path.join(dir1, dir2).replace(/\\/g, '/');
    if (FS.existsSync(directory)) {
      return true;
    }
    else {
      FS.mkdirSync(directory);
      return directory;
    }
  }
  catch (e) {
    console.log(e);
  }
}
module.exports.createresultdir = async function (dir_name, filepath) {
  try {
    let directory = "";
    let created_path;
    console.log(path);
    directory = path.join(app.getPath('userData'), "resultfolder");
    if (FS.existsSync(directory)) {
      created_path = module.exports.createdirectorywithtimestamp(directory, dir_name, filepath);
    }
    else {
      FS.mkdirSync(directory);
      created_path = module.exports.createdirectorywithtimestamp(directory, dir_name, filepath);
    }
    return created_path;
  }
  catch (e) {
    console.log(e);
  }
}
async function checkGhostscriptInstalled() {
  const platform = process.platform === 'win32'
    ? (process.arch === 'x64' ? 'gswin64c' : 'gswin32c')
    : process.platform === 'darwin'
      ? 'gs'
      : 'gs';

  const execcmd = `${platform} --version`;

  return new Promise((resolve, reject) => {
    exec(execcmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Ghostscript is not installed.');
        resolve(false);
        return;
      }
      console.log(`Ghostscript version: ${stdout.trim()}`);
      resolve(true);
    });
  });
}

module.exports.checkGhostscript = async function () {
  let isInstalled = await checkGhostscriptInstalled();
  if (isInstalled) {
    console.log('Ghostscript is installed.');
    return false;
  } else {
    console.log('Ghostscript is not installed.');
    return true;
  }
};