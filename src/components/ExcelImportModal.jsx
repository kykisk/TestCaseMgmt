import { useState } from 'react';
import { Upload, FileDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Modal from './common/Modal';
import Button from './common/Button';
import { parseExcelFile, validateTestCases, convertExcelToTestCases, downloadExcelTemplate } from '../utils/excelImport';

/**
 * 엑셀 가져오기 모달
 */
export default function ExcelImportModal({ isOpen, onClose, onImport, selectedProject }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 파일 확장자 확인
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      alert('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      // 엑셀 파일 파싱
      const data = await parseExcelFile(selectedFile);
      setParsedData(data);

      // 데이터 검증
      const result = validateTestCases(data);
      setValidationResult(result);
    } catch (error) {
      alert('파일 처리 중 오류 발생: ' + error.message);
      resetState();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!validationResult || validationResult.valid.length === 0) {
      alert('가져올 유효한 데이터가 없습니다.');
      return;
    }

    // 엑셀 데이터를 테스트케이스 형식으로 변환
    const testCases = convertExcelToTestCases(validationResult.valid, selectedProject.id);

    onImport(testCases);
    resetState();
    onClose();
  };

  const resetState = () => {
    setFile(null);
    setParsedData(null);
    setValidationResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="엑셀에서 테스트케이스 가져오기">
      <div>
        {/* 템플릿 다운로드 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="text-blue-600 mr-3 mt-1" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">엑셀 템플릿 사용 안내</h4>
              <p className="text-sm text-blue-800 mb-3">
                표준 엑셀 템플릿을 다운로드하여 작성 후 업로드해주세요.
              </p>
              <Button
                type="button"
                variant="primary"
                onClick={downloadExcelTemplate}
                className="text-sm flex items-center space-x-2"
              >
                <FileDown size={16} />
                <span>템플릿 다운로드</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 파일 업로드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            엑셀 파일 업로드
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-600">
                  <span>파일 선택</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">또는 드래그 앤 드롭</p>
              </div>
              <p className="text-xs text-gray-500">.xlsx, .xls 파일 (최대 10MB)</p>
            </div>
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              선택된 파일: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        {/* 처리 중 표시 */}
        {isProcessing && (
          <div className="text-center py-4">
            <p className="text-gray-600">파일 처리 중...</p>
          </div>
        )}

        {/* 검증 결과 */}
        {validationResult && (
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">검증 결과</h4>

            {/* 성공 */}
            {validationResult.valid.length > 0 && (
              <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="text-success mr-2" size={20} />
                  <span className="font-medium text-success">
                    유효한 데이터: {validationResult.valid.length}개
                  </span>
                </div>
              </div>
            )}

            {/* 오류 */}
            {validationResult.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start mb-2">
                  <XCircle className="text-danger mr-2 mt-1" size={20} />
                  <div className="flex-1">
                    <span className="font-medium text-danger">
                      오류 항목: {validationResult.errors.length}개
                    </span>
                    <div className="mt-3 max-h-48 overflow-y-auto">
                      {validationResult.errors.map((error, index) => (
                        <div key={index} className="mb-2 text-sm">
                          <span className="font-medium">행 {error.row}:</span>
                          <ul className="ml-4 mt-1 list-disc list-inside text-red-700">
                            {error.errors.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleImport}
            disabled={!validationResult || validationResult.valid.length === 0}
          >
            가져오기 ({validationResult?.valid.length || 0}개)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
