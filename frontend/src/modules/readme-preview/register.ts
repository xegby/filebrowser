import { register } from "@/modules/registry";
import ReadmePreview from "./ReadmePreview.vue";
import ProfileForm from "./ProfileForm.vue";

// Register the README preview to render after the file listing
register("filelisting:after", ReadmePreview);
// Register the settings form as a new column appended after existing columns
register("profile:after-columns", ProfileForm);
