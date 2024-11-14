<template>
    <v-container>
        <div class="mt-3">
            <h2>{{ $t("TitleStr") }}</h2>
        </div>
        <div class="mt-1 d-flex flex-column">
            <div class="d-flex flex-column my-2 px-3" style="width: 100%;border: 1px solid gray;border-radius: 10px;">
                <div class="my-1">
                    <p class="text-h6">{{ $t("inputStr") }}</p>
                </div>
                <div class="d-flex flex-row pb-3">
                    <v-text-field hide-details variant="outlined" density="compact" v-model="inputPath"
                        readonly></v-text-field>
                    <v-btn variant="flat" color="secondary" @click="addFile(0)" style="min-height: 40px;"
                        class="ml-1">{{
                            $t("browseStr") }}</v-btn>
                </div>
            </div>
            <div class="d-flex flex-column my-2 px-3"
                style="width: 100%; border: 1px solid gray;height: 30%;border-radius: 10px;">
                <v-row class="my-2">
                    <v-col cols="4">
                        <p class="text-h6">{{ $t("PDFAStr") }}</p>
                    </v-col>
                    <v-col cols="5">
                        <v-select v-model="Alevel" density="compact" variant="solo" :items="PdfAlevels"
                            hide-details></v-select>
                    </v-col>
                    <v-col cols="3" class="d-flex justify-end">
                        <v-btn :disabled="!inputPath || checkghostscriptflag" color="secondary"
                            style="min-height: 40px;" class="ml-1" @click="convertFileToPDFA">{{ $t("convertStr")}}</v-btn>
                    </v-col>
                </v-row>
            </div>
        </div>
        <v-dialog v-model="is_loading">
            <div class="text-center">
                <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </div>
        </v-dialog>
    </v-container>
</template>
<style lang="css" scoped>
.lblwidth {
    width: 230px;
}

.flex-grow-1 {
    flex-grow: 1;
    /* Makes the text field grow to take available space */
}

.v-progress-circular {
    margin: 1rem;
}
</style>
<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import i18n from "@/localization/i18n";
const inputPath = ref('' as string);
const Alevel = ref("PDF/A-1b" as string);
const currentLanguage = ref("" as string);
const PdfAlevels = ref(["PDF/A-1b", "PDF/A-2b", "PDF/A-3b"]);
const image = ref("" as string);
const keyFile = ref("" as string);
const certFile = ref("" as string);
const pdfconverstionstatus = ref("" as string);
const convertedpath = ref("" as string);
const is_loading = ref(false as boolean);

let checkghostscriptflag = ref(false as boolean);

declare global {
    interface Window {
        ipcRenderer: any;
    }
}
let fileConversionSetting = reactive({
    autoUploadEnabled: false,
    TypeofPdf: "PDF/A",
    pdfAlevel: "PDF/A-1b",
    pdfXlevel: "PDF/X-1a_2001",
    Colorselected: "sRGB",
    optionSelected: "Imaging (Page)",
});
const Options = ref([
    "Return Error",
    "Convertible Range",
    "Imaging (Page)",
    "Imaging (Always)",
]);
const colorOptions = ref([
    "sRGB",
    "Adobe RGB (1998)",
    "Apple RGB",
    "ColorMatch RGB",
    "US Web Coated (SWOP) v2",
    "US Web Uncoated v2",
    "Coated GRACoL 2006 (ISO 12647-2:2004)",
    "Web Coated SWOP Grade 3 Paper",
    "eb Coated SWOP Grade 5 Paper",
    "Coated FOGRA27 (ISO 12647-2:2004)",
    "Web Coated FOGRA28 (ISO 12647-2:2004)",
    "Uncoated FOGRA29 (ISO 12647-2:2004)",
    "Coated FOGRA39 (ISO 12647-2:2004)",
    "Japan Web Coated (Ad)",
    "Japan Color 2001 Coated",
    "Japan Color 2001 Uncoated",
    "Japan Color 2002 Newspaper",
    "Japan Color 2003 Web Coated",
]);
watch(Alevel, (newVal) => {
    {
        fileConversionSetting.pdfAlevel = newVal;
    }
});
onMounted(async () => {
    console.log("== selectionsPage.vue :onMounted");
    currentLanguage.value = await window.ipcRenderer.invoke("ipc-invoke", {
        message: "get_language",
    });
    if (
        typeof currentLanguage.value === "undefined" ||
        currentLanguage.value === null
    ) {
        currentLanguage.value = "日本語";
        i18n.global.locale = "en-US";
    }
    if (currentLanguage.value === "日本語") {
        i18n.global.locale = "en-US";
    } else {
        i18n.global.locale = "en-US";
    }
    console.log("current language", currentLanguage.value);
    let checkghostscriptavailability = await window.ipcRenderer.invoke('ipc-invoke', { message: "checkGhostscript", params: {} });
    checkghostscriptflag.value = checkghostscriptavailability;
    console.log(checkghostscriptavailability);
});
async function addFile(flag: number, type?: string): Promise<void> {
    let extensionparams;
    if (flag === 0) {
        extensionparams = ['jpeg', 'jpg', 'png', 'pdf', 'tiff', 'tif', 'bmp'];
    }
    if (flag === 1) {
        extensionparams = ['jpeg', 'jpg', 'png'];
    }
    if (flag === 2) {
        extensionparams = ['pem'];
	}
    let result_file_directory = await window.ipcRenderer.invoke('ipc-invoke', { message: "operation_open_dialog_touploadcustomfiles", params: {extensionparams: extensionparams} });
    if (result_file_directory.canceled) {
        return;
    }
    else {
        let ReceivedJson = result_file_directory;
        if (flag === 0) {
            inputPath.value = ReceivedJson.selectedItems[0];
        }
        if (flag === 1) {
            image.value = ReceivedJson.selectedItems[0];
        }
        if (flag === 2) {
            if (type === "keyRSA") {
                keyFile.value = ReceivedJson.selectedItems[0];
            }
            if (type === "certFle") {
                certFile.value = ReceivedJson.selectedItems[0];
            }
        }
        pdfconverstionstatus.value = "";
    }

}
async function convertFileToPDFA(): Promise<void> {
    is_loading.value = true;
    const targetFolder = await create_timestamp_folder(inputPath);
    let params: any = "";
    params = {
        filetype: fileConversionSetting.TypeofPdf,
        pdflevel: PdfAlevels.value.indexOf(fileConversionSetting.pdfAlevel) + 1,
        filepath: inputPath.value,
        option: Options.value.indexOf(fileConversionSetting.optionSelected) + 1,
        color: colorOptions.value.indexOf(fileConversionSetting.Colorselected),
        outputpath: targetFolder,
    };
    let isPdfA = await window.ipcRenderer.invoke("ipc-invoke", {
        message: "CheckPDFAfile",
        filepath: inputPath.value,
        targetFolder: targetFolder
    });
    console.log("--- isPdfA ---- ", isPdfA);
    if (isPdfA == true) {
        console.log("The file is already PDF/A. No conversion needed.");
        pdfconverstionstatus.value = 'Success';
        convertedpath.value = targetFolder;
    } else {
        let pdfaconversion = "";
        pdfaconversion = await window.ipcRenderer.invoke("ipc-invoke", {
            message: "pdfafileconversion",
            params: params,
        });
        pdfconverstionstatus.value = pdfaconversion;
        convertedpath.value = targetFolder;
    }
    is_loading.value = false;
}

async function create_timestamp_folder(inputPath: any) {
  let resultfolderdirname = "";
  let tschunk = Date.now();
  resultfolderdirname = date2displaydate(tschunk);
  resultfolderdirname = resultfolderdirname.replaceAll("/", "-");
  resultfolderdirname = resultfolderdirname.replaceAll(":", ".");
  let createdPath = await window.ipcRenderer.invoke("ipc-invoke", {
    message: "createresultdir",
    params: { dir_name: resultfolderdirname, filepath: inputPath.value },
  });
  return createdPath;
}
function date2displaydate(datestring: any) {
  try {
    const datetime = new Date(datestring);
    let displaystring = "";
    displaystring += datetime.getFullYear();
    displaystring += "/";
    displaystring += ("00" + (datetime.getMonth() + 1)).slice(-2);
    displaystring += "/";
    displaystring += ("00" + datetime.getDate()).slice(-2);
    displaystring += "_";
    displaystring += ("00" + datetime.getHours()).slice(-2);
    displaystring += ":";
    displaystring += ("00" + datetime.getMinutes()).slice(-2);
    displaystring += ":";
    displaystring += ("00" + datetime.getSeconds()).slice(-2);
    displaystring += ".";
    displaystring += ("000" + datetime.getMilliseconds()).slice(-3);
    return displaystring;
  } catch (e) {
    return datestring;
  }
}
</script>
<style>
</style>