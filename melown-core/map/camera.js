
Melown.Map.prototype.updateCamera = function() {
    var controlMode_ = "observer";
    var position_ = [0,0,0];
    var orientation_ = this.position_.getOrientation();

    this.updateCameraMatrix_ = Melown.mat4.create();

    //check position orientaion ...
    this.position_.check();

    //get camera distance
    this.cameraDistance_ = this.position_.getViewDistance();
    this.cameraDistance_ = Melown.clamp(this.cameraDistance_, 0.1, this.camera_.getFar());


    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(orientation_[0])), Melown.rotationMatrix(0, Melown.radians(orientation_[1])), this.updateCameraMatrix_);

    //Melown.mat4.multiply(this.updateCameraMatrix_, Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), this.updateCameraMatrix_);

    //this.updateCameraMatrix_ = Melown.mat4.inverse(this.updateCameraMatrix_);
    //this.updateCameraMatrix_ = Melown.rotationMatrix(0, -Melown.radians(orientation_[1]));

    //var height_ = 227;
    var height_ = this.position_.getHeight();

    if (this.position_.getHeightMode() == "float") {
        var lod_ =  this.getOptimalHeightLod(this.position_.getCoords(), this.position_.getViewExtent(), this.config_.mapNavSamplesPerViewExtent_);
        var surfaceHeight_ = this.getSurfaceHeight(this.position_.getCoords(), lod_);
        height_ += surfaceHeight_[0];
    }


    if (this.getNavigationSrs().isProjected()) {
        
        if (this.position_.getViewMode() == "obj") {
            var orbitPos_ = [0, -this.cameraDistance_, 0];
            Melown.mat4.multiplyVec3(this.updateCameraMatrix_, orbitPos_);
        } else {
            var orbitPos_ = [0, 0, 0];
        }

        this.cameraVector_ = [0, 1, 0];
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, this.cameraVector_);

        //this.camera_.setPosition(orbitPos_);
        this.camera_.setOrientation(orientation_);
        this.renderer_.cameraDistance_ = this.cameraDistance_;

        /*
        this.updateCameraMatrix_ = Melown.mat4.create();

        //Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), Melown.rotationMatrix(0, Melown.radians(-orientation_[1] - 90.0)), this.updateCameraMatrix_);
        Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians(-orientation_[1] - 90.0)), Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), this.updateCameraMatrix_);

        //get NED for latlon coordinates
        //http://www.mathworks.com/help/aeroblks/directioncosinematrixeceftoned.html
        var coords_ = this.position_.getCoords();
        var lon_ = Melown.radians(0);
        var lat_ = Melown.radians(89);

        //NED vectors for sphere
        var east_ = [-Math.sin(lat_)*Math.cos(lon_), -Math.sin(lat_)*Math.sin(lon_), Math.cos(lat_)];
        var direction_ = [-Math.sin(lon_), Math.cos(lon_), 0];
        var north_ = [-Math.cos(lat_)*Math.cos(lon_), -Math.cos(lat_)*Math.sin(lon_), -Math.sin(lat_)];
        //direction_ = [-direction_[0], -direction_[1], -direction_[2]];

        //east_  = [1,0,0];
        //direction_ = [0,1,0];
        //north_ = [0,0,1];

        north_ = Melown.vec3.negate(north_);
        east_  = Melown.vec3.negate(east_);
        //direction_ = Melown.vec3.negate(direction_);

        /*
        //get elipsoid factor
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();
        var factor_ = navigationSrsInfo_["b"] / navigationSrsInfo_["a"];

        //flaten vectors
        north_[2] *= factor_;
        east_[2] *= factor_;
        direction_[2] *= factor_;

        //normalize vectors
        north_ = Melown.vec3.normalize(north_);
        east_  = Melown.vec3.normalize(east_);
        direction_ = Melown.vec3.normalize(direction_);

        */

        //this.updateCameraMatrix_ = Melown.mat4.inverse(this.updateCameraMatrix_);
        /*
        //rotate vectors according to eulers
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, north_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, east_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, direction_);

        //var t = north_[0]; north_[0] = north_[1]; north_[1] = t; north_[2] = -north_[2];
        //var t = east_[0]; east_[0] = east_[1]; east_[1] = t; east_[2] = -east_[2];
        //var t = direction_[0]; direction_[0] = direction_[1]; direction_[1] = t; direction_[2] = -direction_[2];

        //get rotation matrix
        var rotationMatrix_ = [
            east_[0], east_[1], east_[2], 0,
            direction_[0], direction_[1], direction_[2], 0,
            north_[0], north_[1], north_[2], 0,
            0, 0, 0, 1
        ];

        //Melown.mat4.transpose(rotationMatrix_);
        //rotationMatrix_ = Melown.mat4.inverse(rotationMatrix_);


        var orbitPos2_ = [0, -this.cameraDistance_, 0];
        Melown.mat4.multiplyVec3(rotationMatrix_, orbitPos2_);

        var orbitPos3_ = [0, this.cameraDistance_, 0];
        Melown.mat4.multiplyVec3(rotationMatrix_, orbitPos3_);

        rotationMatrix_ = Melown.mat4.inverse(rotationMatrix_);

        var orbitPos4_ = [0, -this.cameraDistance_, 0];
        Melown.mat4.multiplyVec3(rotationMatrix_, orbitPos4_);

        var orbitPos5_ = [0, -this.cameraDistance_, 0];
        Melown.mat4.multiplyVec3(rotationMatrix_, orbitPos5_);

        orbitPos_ = orbitPos_;

        //this.camera_.setPosition(orbitPos_);
        this.camera_.setRotationMatrix(rotationMatrix_);
        //this.renderer_.cameraDistance_ = this.cameraDistance_;
        */

    } else { //geographics

        //get NED for latlon coordinates
        //http://www.mathworks.com/help/aeroblks/directioncosinematrixeceftoned.html
        var coords_ = this.position_.getCoords();
        var lon_ = Melown.radians(coords_[0]);
        var lat_ = Melown.radians(coords_[1]);

        //NED vectors for sphere
        var north_ = [-Math.sin(lat_)*Math.cos(lon_), -Math.sin(lat_)*Math.sin(lon_), Math.cos(lat_)];
        var east_ = [-Math.sin(lon_), Math.cos(lon_), 0];
        var direction_ = [-Math.cos(lat_)*Math.cos(lon_), -Math.cos(lat_)*Math.sin(lon_), -Math.sin(lat_)];

        //get elipsoid factor
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();
        var factor_ = navigationSrsInfo_["b"] / navigationSrsInfo_["a"];

        //flaten vectors
        north_[2] *= factor_;
        east_[2] *= factor_;
        direction_[2] *= factor_;

        //normalize vectors
        north_ = Melown.vec3.normalize(north_);
        east_  = Melown.vec3.normalize(east_);
        direction_ = Melown.vec3.normalize(direction_);

        //rotate vectors according to eulers
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, north_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, east_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, direction_);

        //get rotation matrix
        var rotationMatrix_ = [
            north_[0], north_[1], north_[2], 0,
            east_[0], east_[1], east_[2], 0,
            direction_[0], direction_[1], direction_[2], 0,
            0, 0, 0, 1
        ];

        var orbitPos_ = [0, -this.cameraDistance_, 0];
        Melown.mat4.multiplyVec3(rotationMatrix_, orbitPos_);

        //this.camera_.setPosition(orbitPos_);
        this.camera_.setRotationMatrix(rotationMatrix_);
        this.renderer_.cameraDistance_ = this.cameraDistance_;
    }

    this.camera_.setViewHeight(this.position_.getViewExtent());
    //this.camera_.setOrtho(true);

    this.camera_.setParams(this.position_.getFov()*0.5, this.renderer_.camera_.getNear(), this.renderer_.camera_.getFar());


    //convert public coords to physical
    var worldPos_ = this.convertCoords([this.position_.getCoords()[0], this.position_.getCoords()[1], height_], "navigation", "physical");
	worldPos_[0] += orbitPos_[0];
	worldPos_[1] += orbitPos_[1];
	worldPos_[2] += orbitPos_[2];
    this.camera_.setPosition([0,0,0]); //always zeros

	//var camCoords_ = orbitPos


    //var worldPos_ = [this.position_.getCoords()[0], this.position_.getCoords()[1], height_];

    //console.log("height: " + JSON.stringify(height2_));

    this.cameraPosition_ = worldPos_;

    //auto far plane
    /*
    var far_ = this.camera_.getFar();

    var maxDistance_ = this.cameraDistance_ * (Math.tan(this.camera_.getFov()*0.5) / this.camera_.getAspect());

    maxDistance_ *= Math.tan(Melown.radians(90+this.orientation_[1]*0.10));
    maxDistance_ = maxDistance_ > 9000000.0 ? 9000000.0 : maxDistance_;
    maxDistance_ = maxDistance_ < this.core_.coreConfig_.cameraVisibility_ ? this.core_.coreConfig_.cameraVisibility_ : maxDistance_;

    if (Math.abs(maxDistance_- far_) > 1.0) {
        this.camera_.setParams(this.camera_.getFov(), this.camera_.getNear(), maxDistance_);
    }
    */

    //this.dirty_ = true;
};

Melown.Map.prototype.cameraHeight = function() {
    //TODO: get camera height
    //var cameraPos_ = this.camera_.position_;
    //return (this.camera_.getPosition()[2] - this.planet_.surfaceHeight([this.position_[0] + cameraPos_[0], this.position_[1] + cameraPos_[1]])[0]);

    //hack - distance intead of height
    return this.cameraDistance_;
};




