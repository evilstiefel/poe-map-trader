import { Component, Input } from '@angular/core';
import { StaticItem } from 'src/app/shared/interfaces/trade-interfaces';

@Component({
  selector: 'app-map-selector',
  templateUrl: './map-selector.component.html',
  styleUrls: ['./map-selector.component.scss']
})
export class MapSelectorComponent {

  @Input()
  set maps(maps: StaticItem[]) {
    this.selectableMaps = maps
      .filter(m => !m.text.toLocaleLowerCase().includes('shaped'))
      .map(m => ({ ...m, selected: false }));
    this.selectableShapedMaps = maps
      .filter(m => m.text.toLocaleLowerCase().includes('shaped'))
      .map(m => ({ ...m, selected: false }));
  }

  selectableMaps: Array<StaticItem & { selected: boolean }>;
  selectableShapedMaps: Array<StaticItem & { selected: boolean }>;
  constructor() { }

  /**
   * tracks maps for the dom
   * @param idx index
   * @param map StaticItem of the map
   */
  trackByFn(idx: number, map: StaticItem) {
    return map.id;
  }

  /**
   * Toggles map selection status in the most cumbersome way imaginable
   * @param id id of the map to toggle
   */
  selectMap(id: string) {
    if (this.selectableMaps.find(m => m.id === id)) {
      this.selectableMaps = this.selectableMaps.map<StaticItem & { selected: boolean }>(
        m => ({ ...m, selected: (id === m.id) ? !m.selected : m.selected })
      );
    } else if (this.selectableShapedMaps.find(m => m.id === id)) {
      this.selectableShapedMaps = this.selectableShapedMaps.map<StaticItem & { selected: boolean }>(
        m => ({ ...m, selected: (id === m.id) ? !m.selected : m.selected })
      );
    } else {
      return;
    }
  }

}
