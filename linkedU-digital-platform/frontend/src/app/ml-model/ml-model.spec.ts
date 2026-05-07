import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MlModelComponent } from './ml-model.component';

describe('MlModelComponent', () => {
  let component: MlModelComponent;
  let fixture: ComponentFixture<MlModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlModelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MlModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.predictionForm.country).toBe('');
    expect(component.predictionForm.major).toBe('');
    expect(component.predictionForm.language).toBe('');
    expect(component.predictionForm.moyenne).toBeNull();
    expect(component.predictionForm.tuitionTier).toBeNull();
  });

  it('should show error if form is empty on submit', () => {
    component.onSubmit();
    expect(component.error).toBe('Please fill all fields');
    expect(component.isLoading).toBeFalse();
  });
});