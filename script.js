var _launchButton = document.getElementById("launch_btn");
_previewDiv = document.getElementById("pp_preview_div");
_loaderDiv = document.getElementById("pp_loader_div");

// this is to disable the launch button until PitchPrint is ready for use
_launchButton.setAttribute("disabled", "disabled");

// initializing PitchPrint (used my own API key and design ID)

var ppClient = new PitchPrintClient({
  apiKey: "key_26edfc2cb57d64ce529a3a9e098c63bd",
  designId: "d42302b363615e5572feae8060eed01c",
  userId: "37063281-a764-4b5b-8163-cec7ab1884a9",
  custom: true,
});

function doClient() {
  _productId = null;
  let _store = window.localStorage.getItem("pprint_custom_store");
  if (typeof _store === "string") _store = JSON.parse(_store);
  let _cValues = _store[_productId] || {};
  if (typeof _cValues === "string") _cValues = _decode(_cValues);
  if (!document.getElementById("_pitchprint"))
    _cartForm.insertAdjacentHTML(
      "afterbegin",
      `<input id="_pitchprint" name="properties[_pitchprint]" type="hidden" value="${
        _cValues.projectId || ""
      }">`
    );

  window.ppclient.userAccountPath = "/dashboard.html";
  window.ppclient = new PitchPrintClient({
    userId: window.__st.cid || "guest",
    designId: _values.designId,
    mode:
      _cValues.type === "u" ? "upload" : _cValues.projectId ? "edit" : "new",
    projectId: _cValues.projectId || "",
    apiKey: window.Shopify.shop,
    product: {
      id: _productId,
      name: window.__st.pageurl.split("/").pop().split("-").join(" "),
    },
  });

  window.ppclient.on("session-saved", _saveSession);
}
// This function will run/launch the app once it's ready for use
var appValidated = () => {
  _launchButton.removeAttribute("disabled");
  _launchButton.onclick = () => ppClient.showApp();
  _loaderDiv.style.display = "none";
};

// This function will run when the app has been used and user has saved some projects
var projectSaved = (_val) => {
  var _el = document.getElementById("_pitchprint"),
    _projectId = _val.data.projectId;

  let _store = window.localStorage.getItem("pprint-custom_store") || {},
    _projects = window.localStorage.getItem("pprint-projects") || {};

  if (typeof _store === "string") _store = JSON.parse(_store);
  if (typeof _projects === "string") _projects = JSON.parse(_projects);

  if (_val.data.clear) {
    _el.value = "";
    delete _store[_productId];
    delete _projects[_projectId];
  } else {
    _el.value = _projectId;
    _store[_productId] = _val.data.values;
    _projects[_projectId] = _val.data.values;
    if (_projectId.substr(0, 2) === "U-") {
      delete _projects[_projectId].previews;
      _zipFiles(_val.data.values);
      console.log(_projects[_projectId]);
    }
  }
  window.localStorage.setItem("pprint-custom_store", JSON.stringify(_store));
  window.localStorage.setItem("pprint-projects", JSON.stringify(_projects));
  if (_val.data.clear) window.location.reload();
};

ppClient.on("app-validated", appValidated);
ppClient.on("project-saved", projectSaved);

// get data from saved projects

const apiURL = "https://api.pitchprint.io/client/fetch-recent";

fetch(apiURL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    saveForLater: "",
    token:
      "4ae0afe5028cb7fe6d28015768900358:e6a37f6eeafaefd9b8b2e94065f69372a7277c4e24341f8ebcbdf48a9c86932b671c02f414af1d45e5e5fd77abf35a44c5ff8a260fd8e695e00905e2c5185b8d9b446e2adf382f24714ad63270df5293e024475e746199092bb319f8b8e43e9ec005ca478ff8405fc61c496ad6b0ab7e5fdd8243d1dcb3ad958974fdd0e0e0bd986a27464e0f4cda4ada65275e02f5589b22e9472f03b06128146e3c02f8950c2b1214755937baf9f4ed3b20bdcefdfc590c2f6473766cc99b8947483a543aba3c9e1ecd41631f5d4bd99693b5443b374f4173231e4e6af02904fd4b96500da8",
  }),
})
  .then((res) => res.json())
  .then((data) => {
    // display data

    const contentPreview = document.getElementById("content");
    if (data.data.length > 0) {
      data.data.forEach((project) => {
        const projectDiv = document.createElement("div");

        projectDiv.id = project.id;
        projectDiv.innerHTML = `<p>${project.title}</p>`;

        contentPreview.appendChild(projectDiv);
      });
    }
  });
