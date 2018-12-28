const { Service } = require('feathers-memory');
const kdbush = require('kdbush')
const geokdbush = require('geokdbush')

class LocationService extends Service {

    constructor(options) {
        options.store.map((value, index)=>{
            if(typeof(value.lat) !== 'number' && typeof(value.lon) !== 'number') {
                throw new Error('Missing lat and lng values for Locations store item');
            }
            if(!('id' in value)) {
                value.id = index;
            }
            return value;
        })
        super(options);
        this.geoIndex = new kdbush(this.store, (p) => p.lon, (p) => p.lat);
    }

    async _find(params) {
        const { query } = params;
        if(query.$nearby) {
            const $nearby = query.$nearby;
            delete query.$nearby;

            if(!('$lat' in $nearby)) {
                throw new Error('$nearby missing $lat');
            } else if(!('$lon' in $nearby)) {
                throw new Error('$nearby missing $lon');
            } else if(!('$maxDistance' in $nearby)) {
                throw new Error('$nearby missing $maxDistance');
            }
            
            const store = this.store;
            this.store = geokdbush.around(this.geoIndex, $nearby.$lon, $nearby.$lat, null, $nearby.$maxDistance, value=>{
                return geokdbush.distance(value.lon, value.lat, $nearby.$lon, $nearby.$lat) <= $nearby.$maxDistance;
            });
            this.store.map(value=>{
                value.distnace = geokdbush.distance(value.lon, value.lat, $nearby.$lon, $nearby.$lat);
            })
            const result = super._find(params);

            this.store = store;

            return result;
        }
        return super._find(params);
    }

}

module.exports = LocationService;