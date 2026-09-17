(function () {
  if (!window.THREE || !window.THREE.GLTFLoader) return;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createViewer(container) {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    var loader = new THREE.GLTFLoader();
    var group = new THREE.Group();
    var model = null;
    var dragging = false;
    var lastX = 0;
    var lastY = 0;
    var orbitX = parseFloat(container.getAttribute("data-orbit-x") || "0.86");
    var orbitY = parseFloat(container.getAttribute("data-orbit-y") || "1.2");
    var zoom = 1;
    var radius = 3.2;
    var spin = container.getAttribute("data-auto-rotate") !== "false";
    var loading = document.createElement("span");
    loading.className = "viewer-loader";

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(loading);
    container.appendChild(renderer.domElement);

    scene.add(group);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8e7ff, 1.4));

    var key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 6, 6);
    scene.add(key);

    var fill = new THREE.DirectionalLight(0xd8e7ff, 1.05);
    fill.position.set(-5, 3, -3);
    scene.add(fill);

    function resize() {
      var width = Math.max(container.clientWidth, 1);
      var height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    function updateCamera() {
      var distance = radius * zoom;
      var x = Math.cos(orbitX) * Math.sin(orbitY) * distance;
      var y = Math.cos(orbitY) * distance * 0.82;
      var z = Math.sin(orbitX) * Math.sin(orbitY) * distance;
      camera.position.set(x, y, z);
      camera.lookAt(0, 0, 0);
    }

    function centerModel() {
      var box = new THREE.Box3().setFromObject(model);
      var center = box.getCenter(new THREE.Vector3());
      var size = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      model.position.y -= size.y * 0.04;
      if (container.hasAttribute("data-home-model")) {
        model.position.x += size.x * 0.12;
      }
      radius = Math.max(size.x, size.y, size.z) * (container.hasAttribute("data-compact") ? 1.82 : 1.58);
      if (container.hasAttribute("data-home-model")) radius *= 1.18;
      if (container.hasAttribute("data-wide")) radius *= 1.1;
      zoom = 1;
      updateCamera();
    }

    function load(src, onDone) {
      if (!src) return;
      container.classList.add("is-loading");
      if (model) {
        group.remove(model);
        model = null;
      }

      loader.load(src, function (gltf) {
        model = gltf.scene;
        model.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
          }
        });
        group.add(model);
        centerModel();
        container.classList.remove("is-loading");
        if (onDone) onDone();
      }, undefined, function () {
        container.classList.remove("is-loading");
        if (onDone) onDone();
      });
    }

    function animate() {
      requestAnimationFrame(animate);
      if (model && spin && !dragging) {
        model.rotation.y += 0.0045;
      }
      renderer.render(scene, camera);
    }

    function inDragZone(event) {
      var rect = container.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var cx = rect.width / 2;
      var cy = rect.height / 2;
      var rx = rect.width * 0.28;
      var ry = rect.height * 0.32;
      var dx = (x - cx) / Math.max(rx, 1);
      var dy = (y - cy) / Math.max(ry, 1);
      return (dx * dx + dy * dy) <= 1;
    }

    container.addEventListener("pointerdown", function (event) {
      if (!inDragZone(event)) return;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      container.classList.add("is-dragging");
      if (container.setPointerCapture) container.setPointerCapture(event.pointerId);
    });

    container.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      orbitX -= (event.clientX - lastX) * 0.008;
      orbitY = clamp(orbitY - (event.clientY - lastY) * 0.008, 0.5, 2.25);
      lastX = event.clientX;
      lastY = event.clientY;
      updateCamera();
    });

    function stopDrag() {
      dragging = false;
      container.classList.remove("is-dragging");
    }

    container.addEventListener("pointerup", stopDrag);
    container.addEventListener("pointercancel", stopDrag);
    container.addEventListener("pointerleave", stopDrag);
    container.addEventListener("wheel", function (event) {
      event.preventDefault();
      zoom = clamp(zoom + event.deltaY * 0.0014, 0.72, 1.86);
      updateCamera();
    }, { passive: false });

    resize();
    updateCamera();
    animate();

    container.viewerApi = {
      load: load,
      resize: resize
    };

    return {
      loadInitial: function () {
        if (container.dataset.loaded === "true") return;
        container.dataset.loaded = "true";
        load(container.getAttribute("data-model-src"));
      },
      loadSequential: function (done) {
        if (container.dataset.loaded === "true") {
          if (done) done();
          return;
        }
        container.dataset.loaded = "true";
        load(container.getAttribute("data-model-src"), done);
      }
    };
  }

  function setupViewers() {
    var containers = [].slice.call(document.querySelectorAll("[data-model-viewer]"));
    var viewers = containers.map(function (container) {
      return {
        container: container,
        instance: createViewer(container)
      };
    });

    function loadNext(index) {
      if (index >= viewers.length) return;
      viewers[index].instance.loadSequential(function () {
        loadNext(index + 1);
      });
    }

    loadNext(0);

    window.addEventListener("resize", function () {
      containers.forEach(function (container) {
        if (container.viewerApi) container.viewerApi.resize();
      });
    });
  }

  function setupSwitchers() {
    document.querySelectorAll("[data-model-group]").forEach(function (group) {
      var viewer = group.querySelector("[data-model-viewer]");
      if (!viewer || !viewer.viewerApi) return;

      group.querySelectorAll(".switcher [data-model-src]").forEach(function (button) {
        button.addEventListener("click", function () {
          viewer.viewerApi.load(button.getAttribute("data-model-src"));
          group.querySelectorAll(".switcher [data-model-src]").forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
        });
      });
    });
  }

  setupViewers();
  setupSwitchers();
})();
