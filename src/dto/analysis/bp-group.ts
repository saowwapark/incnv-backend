import { RegionBpDto } from '../basepair.dto';

export class BpGroup {
  groupName?: string;
  basepairs?: RegionBpDto[];
  constructor(groupName?, basepairs?) {
    this.groupName = groupName || '';
    this.basepairs = basepairs || [];
  }
}
