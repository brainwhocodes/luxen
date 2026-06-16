import { useShaderBuildEditor } from './useShaderBuildEditor';
import { ShaderEditorTemplate } from '../components/templates/ShaderEditorTemplate';

export function ShaderEditorPage() {
  const props = useShaderBuildEditor();
  return <ShaderEditorTemplate {...props} />;
}
