import Book from '../../../assets/Book.svg';

export const Footer = () => {
  return (
    <footer className="w-full bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="text-6xl font-semibold">Unite</div>
          <div className="text-base flex items-center">
            <a href='https://unite-local-bucket.s3.us-east-1.amazonaws.com/TerminosUnite.pdf' target="_blank" rel="noopener noreferrer">
              <img src={Book} alt="Book" className="w-[72px] h-[72px] mr-2 inline-block" />
              Términos y condiciones
            </a>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-300">© 2025 Unite. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
};
