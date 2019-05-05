import { TestBed } from '@angular/core/testing';

import { StashService } from './stash.service';

describe('StashService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StashService = TestBed.get(StashService);
    expect(service).toBeTruthy();
  });
});
