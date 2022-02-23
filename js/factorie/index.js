iscm.factory('$FactoryIndex',['$http',function($http){
	
    return{
            RequestJson : function( url , data = null )
            {
                return $http({
                    url: url
                    ,method: "POST"
                    ,data: data
                    ,transformRequest: angular.identity
                    ,headers: {'Content-Type': undefined}
                })
            }
    }

}]);