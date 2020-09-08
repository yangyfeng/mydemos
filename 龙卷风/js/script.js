class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);


    this.camera.position.set(0, 1, -30);
    document.body.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.renderer.setSize(innerWidth, innerHeight);

    this.camera.lookAt(new THREE.Vector3(0, 7, 0));
    this.renderer.setAnimationLoop(e => this.update(e));

    this.scene.background = new THREE.Color(0x501010);
    this.scene.background.multiplyScalar(0.5);


    this.scene.fog = new THREE.FogExp2(0x501010, 0.03);


    var light = new THREE.DirectionalLight(0xfffff0, 1.41);
    light.position.set(1, 10, -5);
    this.scene.add(light);

    var light = new THREE.DirectionalLight(0xf0f0ff, 0.4);
    light.position.set(1, -10, -5);
    this.scene.add(light);


    this.target = new THREE.Object3D(2);
    this.scene.add(this.target);
    var mat = new THREE.MeshStandardMaterial({
      color: 0xffc050,
      roughness: 0.7,
      metallness: 0,
      wireframe: false
    });


    this.pivot = this.makeTwister(50, mat);
    this.scene.add(this.pivot);

    this.meatballs = [];
    for (var i = 0; i < 50; i++) {
      var meatball = this.makeMeatball();

      this.scene.add(meatball);
      meatball.position.x = Math.random() * 30 - 15;
      meatball.position.z = Math.random() * 40 - 20;
      meatball.position.y = Math.random() * 50;
      this.meatballs.push(meatball);
    }


    for (var i = 0; i < 70; i++) {
      const tree = this.makeTree();
      tree.position.x = Math.random() * 40 - 20;
      tree.position.z = Math.random() * 50 - 10;
      this.scene.add(tree);

    }



    this.lightning = new THREE.PointLight(0xffffff, 2);
    this.scene.add(this.lightning);
    this.lightning.position.y = 5;
    for (var i = 0; i < 20; i++) {
      var cloud = this.makeMeatball();

      this.scene.add(cloud);
      cloud.scale.setScalar(4 + Math.random() * 3);
      cloud.position.x = Math.random() * 40 - 20;
      cloud.position.z = Math.random() * 20 - 10;
      cloud.rotation.z = -Math.PI / 2;
      cloud.rotation.y = Math.PI / 2;
      cloud.position.y = 20;

    }

  }

  makeTree() {
    const pivot = new THREE.Object3D();

    let cone = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 1, 3, 16, true), new THREE.MeshStandardMaterial({
      color: 0x404040,
      side: THREE.DoubleSide
    }));
    pivot.add(cone);
    cone = cone.clone();
    cone.scale.multiplyScalar(0.8);
    cone.position.y += 1;
    pivot.add(cone);
    cone = cone.clone();
    cone.scale.multiplyScalar(0.8);
    cone.position.y += 1;
    pivot.add(cone);
    pivot.position.y = -4;

    return pivot;
  }

  noiseMap(size, low, high) {

    var c = document.createElement('canvas');
    var g = c.getContext('2d');

    c.width = c.height = size;
    var data = g.getImageData(0, 0, c.width, c.height);
    for (var i = 0; i < size * size * 4; i += 4) {
      var random = Math.floor(Math.random() * (high - low) + low);
      data.data[i + 0] = data.data[i + 1] = data.data[i + 2] = random;
      data.data[i + 3] = 255;
    }
    g.putImageData(data, 0, 0);
    // document.body.appendChild(c);
    return new THREE.CanvasTexture(c);


  }


  makeMeatball() {

    var sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 32, 32),
      new THREE.MeshStandardMaterial({
        displacementMap: this.noiseMap(16, 0, 25),
        roughnessMap: this.noiseMap(16, 210, 255),
        bumpMap: this.noiseMap(64, 0, 4),
        color: 0xaf4020,
        metalness: 0,
        map: this.noiseMap(32, 32, 195)
      }));

    return sphere;

  }


  makeTwister(count, mat) {
    var pivot = new THREE.Object3D();
    for (var i = 0; i < count; i++) {



      var f = i / count;
      var r = 0.1 + f * f * f * 20 * (1 + 0 / 1 * Math.random());
      var geo = new THREE.TorusGeometry(r, 0.17, 16, 100);

      const mesh = new THREE.Mesh(geo, mat);

      var innerPivot = new THREE.Object3D();
      mesh.rotation.x = Math.PI / 2 + Math.random() * 0.2;
      mesh.position.y = 0.3 * i - 3;
      mesh.position.x = f * Math.sin(i / 9);
      innerPivot.add(mesh);
      innerPivot.theta = Math.random() * (1 - f) * 2;
      pivot.add(innerPivot);
    }
    return pivot;
  }

  update(e) {

    this.camera.rotation.z = Math.PI + 0.01 * Math.sin(Date.now() / 100 + Math.sin(Date.now() / 120 + Math.sin(Date.now() / 140)));

    this.target.position.x = 15 * Math.sin(Date.now() / 1000);
    this.target.position.z = 5 * Math.sin(Date.now() / 1460);

    this.lightning.intensity *= 0.85;
    if (Math.random() < 0.02) {
      this.lightning.position.x = Math.random() * 60 - 30;
      this.lightning.intensity = 5;
    }
    this.meatballs.forEach(ball => {

      ball.position.y -= 0.2;
      ball.rotation.z += 0.1;
      if (ball.position.y < -7) ball.position.y += 50;
    });
    this.pivot.children.forEach((child, i, a) => {
      var n = a.length;
      var f = (n - i) / n;
      f = f * f * f;
      var ratio = 0.99 - f / 72;
      child.position.z = (1 - ratio) * this.target.position.z + ratio * child.position.z;

      child.position.x = (1 - ratio) * this.target.position.x + ratio * child.position.x;


      child.rotation.y += child.theta / 5;
    });
    this.renderer.render(this.scene, this.camera);

  }


}

const app = new App();