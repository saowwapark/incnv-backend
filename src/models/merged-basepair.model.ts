import { RegionBpDto } from '../dto/basepair.dto';

import { MergedBasepairDto } from '../dto/analysis/merged-basepair.dto';

import { BpGroup } from '../dto/analysis/bp-group';

export class MergedBasepairModel {
  /**
   *  Get Merged Bps of multiple samples or mulitple cnv tools
   */

  public mergeBpGroups = (bpGroups: BpGroup[]): MergedBasepairDto[] => {
    const map: number[] = this.getMapPosition(bpGroups);
    var allposition = this.convertMapToArrayInt(map);
    this.sortArray(allposition);

    const alloverlapped: MergedBasepairDto[] = [];
    for (let i = 0; i < allposition.length - 1; i++) {
      const iStart = allposition[i];
      const iEnd = allposition[i + 1];

      const namelist = this.getVariantInRange(bpGroups, iStart, iEnd);
      if (namelist.length != 0) {
        const mergedBp = new MergedBasepairDto(iStart, iEnd, namelist);
        alloverlapped.push(mergedBp);
      }
    }

    this.removeContingentList(alloverlapped);

    return alloverlapped;
  };

  getVariantInRange(
    bpGroups: BpGroup[],
    expectedStartBp: number,
    expectedEndBp: number
  ) {
    const namelist: string[] = [];
    for (const bpGroup of bpGroups) {
      const bps = bpGroup.basepairs!;
      const groupName = bpGroup.groupName!;
      for (const bp of bps) {
        if (bp.startBp <= expectedStartBp && bp.endBp >= expectedEndBp) {
          namelist.push(groupName);
        }
      }
    }

    return namelist;
  }

  getMapPosition(bpGroups: BpGroup[]) {
    var map: number[] = [];
    for (const bpGroup of bpGroups) {
      const bps = bpGroup.basepairs!;
      for (const bp of bps) {
        map[bp.startBp] = 1;
        map[bp.endBp] = 1;
      }
    }
    return map;
  }

  sortArray(allkey) {
    allkey.sort((a, b) => (a > b ? 1 : -1));
  }

  convertMapToArrayInt(map) {
    var allkey: any[] = [];
    for (var key in map) {
      allkey.push(parseInt(key));
    }
    return allkey;
  }

  removeContingentList(alloverlapped) {
    for (var i = 0; i < alloverlapped.length - 1; i++) {
      if (alloverlapped[i].end == alloverlapped[i + 1].start) {
        var iEnd = parseInt(alloverlapped[i].end) - 1;
        alloverlapped[i].end = iEnd;
      }
    }
  }
}

export const mergedBasepairModel = new MergedBasepairModel();
