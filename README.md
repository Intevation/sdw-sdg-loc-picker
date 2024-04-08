
## Small location picker App.

Displays an initial Point on the map which the user can move around.
Whenever the marker is moved a MessageEvent is fired upon which surrounding
applications can react.

### Query-Params

| key   | value                                                         |
| ----- | ------------------------------------------------------------- |
| `lat` | Initial-Marker latitude                                       |
| `lng` | Initial-Marker longitude                                      |
| `plz` | Zip-Code - Fallback to zoom into when no lat/lng was provided |

The center point of the region described by `plz` is determined by a simple
query to the [overpass API](http://overpass-api.de/).
