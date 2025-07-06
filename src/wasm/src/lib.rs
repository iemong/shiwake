use wasm_bindgen::prelude::*;

#[cfg(feature = "console_error_panic_hook")]
use console_error_panic_hook::set_once as set_panic_hook;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    set_panic_hook();
    
    console_log!("Photo Sort Core WASM initialized");
}

#[wasm_bindgen]
pub struct PhotoSortCore {
    version: String,
}

#[wasm_bindgen]
impl PhotoSortCore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            version: "1.0.0".to_string(),
        }
    }
    
    #[wasm_bindgen(getter)]
    pub fn version(&self) -> String {
        self.version.clone()
    }
    
    pub fn decode_jpeg_thumbnail(&self, data: &[u8], _max_size: u32) -> Result<Vec<u8>, JsValue> {
        console_log!("Decoding JPEG thumbnail, data size: {}", data.len());
        
        // TODO: 実際のJPEGデコード実装
        Ok(vec![])
    }
    
    pub fn decode_dng_thumbnail(&self, data: &[u8], _max_size: u32) -> Result<Vec<u8>, JsValue> {
        console_log!("Decoding DNG thumbnail, data size: {}", data.len());
        
        // TODO: 実際のDNGデコード実装  
        Ok(vec![])
    }
}