class Sampleset {
  constructor (sampleset) {
    this.samplesetId = sampleset.sampleset_id;
    this.userId = sampleset.user_id;
    this.name = sampleset.name;
    this.description = sampleset.description;
    this.samples = sampleset.samples;
    this.createDate = sampleset.create_date;
    this.modifyDate = sampleset.modify_date;
  }
}

module.exports = Sampleset;
