iscm.factory('$FactoryIndex',['$http',function($http){
	
    return{
            RequestJson : function( url , data = null )
            {
                return $http({
                    url: url
                    ,method: "GET"
                    ,data: data
                    ,transformRequest: angular.identity
                    ,headers: {'Content-Type': undefined}
                })
            }
    }

}]);